<template>
  <div class="restocking">
    <div class="page-header">
      <h2>{{ t('restocking.title') }}</h2>
      <p>{{ t('restocking.description') }}</p>
    </div>

    <!-- Budget Control Bar -->
    <div class="budget-control-card">
      <div class="budget-input-group">
        <label for="budget-input" class="budget-label">{{ t('restocking.budgetLabel') }}</label>
        <div class="budget-input-wrapper">
          <span class="currency-prefix">{{ currentCurrency === 'JPY' ? '¥' : '$' }}</span>
          <input
            id="budget-input"
            v-model.number="budgetInput"
            type="number"
            min="0"
            step="1000"
            class="budget-input"
            :placeholder="t('restocking.budgetPlaceholder')"
          />
        </div>
      </div>
      <button @click="loadRecommendations" class="generate-button" :disabled="loading">
        {{ loading ? t('common.loading') : t('restocking.generate') }}
      </button>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="recommendations.length === 0" class="no-data">
      {{ t('restocking.noRecommendations') }}
    </div>
    <div v-else>
      <!-- Summary Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card info">
          <div class="stat-label">{{ t('restocking.totalBudget') }}</div>
          <div class="stat-value">{{ formatCurrency(summary.budget) }}</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-label">{{ t('restocking.recommendedCost') }}</div>
          <div class="stat-value">{{ formatCurrency(summary.total_cost) }}</div>
        </div>
        <div class="stat-card success">
          <div class="stat-label">{{ t('restocking.budgetRemaining') }}</div>
          <div class="stat-value">{{ formatCurrency(summary.budget_remaining) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('restocking.itemsToOrder') }}</div>
          <div class="stat-value">{{ summary.items_funded }} / {{ summary.items_total }}</div>
        </div>
      </div>

      <!-- Recommendations Table -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('restocking.title') }}</h3>
        </div>
        <div class="table-container">
          <table class="restocking-table">
            <thead>
              <tr>
                <th>{{ t('restocking.table.priority') }}</th>
                <th>{{ t('restocking.table.sku') }}</th>
                <th>{{ t('restocking.table.name') }}</th>
                <th>{{ t('restocking.table.category') }}</th>
                <th>{{ t('restocking.table.warehouse') }}</th>
                <th>{{ t('restocking.table.currentStock') }}</th>
                <th>{{ t('restocking.table.forecastedDemand') }}</th>
                <th>{{ t('restocking.table.deficit') }}</th>
                <th>{{ t('restocking.table.trend') }}</th>
                <th>{{ t('restocking.table.recommendedQty') }}</th>
                <th>{{ t('restocking.table.unitCost') }}</th>
                <th>{{ t('restocking.table.estimatedCost') }}</th>
                <th>{{ t('restocking.table.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="rec in recommendations"
                :key="rec.sku"
                :class="{ 'over-budget': !rec.included_in_budget }"
              >
                <td>
                  <span :class="getPriorityBadgeClass(rec.priority_score)">
                    {{ getPriorityLabel(rec.priority_score) }}
                  </span>
                </td>
                <td><strong>{{ rec.sku }}</strong></td>
                <td>{{ rec.name }}</td>
                <td>{{ rec.category }}</td>
                <td>{{ rec.warehouse }}</td>
                <td>{{ rec.current_stock }}</td>
                <td>{{ rec.forecasted_demand }}</td>
                <td>{{ rec.deficit }}</td>
                <td>
                  <span :class="getTrendBadgeClass(rec.trend)">
                    {{ t('trends.' + rec.trend) }}
                  </span>
                </td>
                <td>
                  <input
                    v-model.number="rec.recommended_quantity"
                    type="number"
                    min="0"
                    class="qty-input"
                    @input="handleQuantityChange"
                  />
                </td>
                <td>{{ formatCurrency(rec.unit_cost) }}</td>
                <td><strong>{{ formatCurrency(rec.estimated_cost) }}</strong></td>
                <td>
                  <span v-if="rec.included_in_budget" class="badge success">
                    {{ t('restocking.funded') }}
                  </span>
                  <span v-else class="badge" style="background: #e2e8f0; color: #64748b;">
                    {{ t('restocking.overBudget') }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '../api'
import { useFilters } from '../composables/useFilters'
import { useI18n } from '../composables/useI18n'
import { formatCurrency as formatCurrencyUtil } from '../utils/currency'

export default {
  name: 'Restocking',
  setup() {
    const { t, currentCurrency } = useI18n()
    const { selectedPeriod, selectedLocation, selectedCategory, selectedStatus, getCurrentFilters } = useFilters()
    const loading = ref(false)
    const error = ref(null)
    const recommendations = ref([])
    const summary = ref({
      budget: 50000,
      total_cost: 0,
      budget_remaining: 50000,
      items_funded: 0,
      items_total: 0
    })
    const budgetInput = ref(50000)

    // Debounce timer for budget input
    let budgetDebounceTimer = null

    const formatCurrency = (value) => {
      return formatCurrencyUtil(value, currentCurrency.value)
    }

    const loadRecommendations = async () => {
      try {
        loading.value = true
        error.value = null
        const filters = getCurrentFilters()
        const data = await api.getRestockingRecommendations(budgetInput.value, filters)

        recommendations.value = data.recommendations
        summary.value = {
          budget: data.budget,
          total_cost: data.total_cost,
          budget_remaining: data.budget_remaining,
          items_funded: data.items_funded,
          items_total: data.items_total
        }
      } catch (err) {
        console.error('Failed to load restocking recommendations:', err)
        error.value = 'Failed to load restocking recommendations: ' + err.message
      } finally {
        loading.value = false
      }
    }

    const handleQuantityChange = () => {
      // Recalculate estimated costs and budget allocation client-side
      let runningTotal = 0
      let itemsFunded = 0

      // Sort by priority score (descending) to allocate budget correctly
      const sorted = [...recommendations.value].sort((a, b) => b.priority_score - a.priority_score)

      sorted.forEach(rec => {
        // Recalculate estimated cost based on new quantity
        rec.estimated_cost = rec.recommended_quantity * rec.unit_cost

        // Check if this item fits in budget
        if (runningTotal + rec.estimated_cost <= budgetInput.value) {
          rec.included_in_budget = true
          runningTotal += rec.estimated_cost
          itemsFunded++
        } else {
          rec.included_in_budget = false
        }
      })

      // Update summary
      summary.value.total_cost = runningTotal
      summary.value.budget_remaining = budgetInput.value - runningTotal
      summary.value.items_funded = itemsFunded
      summary.value.budget = budgetInput.value
    }

    const getPriorityBadgeClass = (score) => {
      if (score >= 400) return 'badge high'
      if (score >= 200) return 'badge medium'
      return 'badge low'
    }

    const getPriorityLabel = (score) => {
      if (score >= 400) return t('priority.high')
      if (score >= 200) return t('priority.medium')
      return t('priority.low')
    }

    const getTrendBadgeClass = (trend) => {
      if (trend === 'increasing') return 'badge increasing'
      if (trend === 'stable') return 'badge stable'
      return 'badge decreasing'
    }

    // Watch filters for changes (excluding period which doesn't apply to restocking)
    watch([selectedLocation, selectedCategory], () => {
      if (!loading.value) {
        loadRecommendations()
      }
    })

    // Watch budget input with debounce
    watch(budgetInput, () => {
      clearTimeout(budgetDebounceTimer)
      budgetDebounceTimer = setTimeout(() => {
        loadRecommendations()
      }, 500)
    })

    onMounted(loadRecommendations)

    return {
      t,
      currentCurrency,
      loading,
      error,
      recommendations,
      summary,
      budgetInput,
      formatCurrency,
      loadRecommendations,
      handleQuantityChange,
      getPriorityBadgeClass,
      getPriorityLabel,
      getTrendBadgeClass
    }
  }
}
</script>

<style scoped>
.restocking {
  padding: 0;
}

.budget-control-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: flex-end;
  gap: 2rem;
  border-left: 4px solid #0d9488;
  border: 1px solid #cbd5e1;
  border-left: 4px solid #0d9488;
  transition: all 0.3s ease;
}

.budget-control-card:hover {
  box-shadow: 0 8px 24px rgba(13, 148, 136, 0.15);
}

.budget-input-group {
  flex: 1;
  max-width: 420px;
}

.budget-label {
  display: block;
  font-size: 0.813rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.budget-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-prefix {
  position: absolute;
  left: 1.25rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0d9488;
  pointer-events: none;
}

.budget-input {
  width: 100%;
  padding: 1rem 1.25rem 1rem 3rem;
  border: 2px solid #cbd5e1;
  border-radius: 10px;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  transition: all 0.3s ease;
  background: #fafafa;
}

.budget-input:focus {
  outline: none;
  border-color: #0d9488;
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.15);
  background: white;
}

.budget-input::-webkit-outer-spin-button,
.budget-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.generate-button {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #0d9488, #14b8a6);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.938rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
}

.generate-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #0f766e, #0d9488);
  box-shadow: 0 6px 20px rgba(13, 148, 136, 0.4);
  transform: translateY(-2px);
}

.generate-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.restocking-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.restocking-table th {
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
  padding: 0.875rem 1rem;
  text-align: left;
  font-weight: 700;
  color: #334155;
  border-bottom: 2px solid #cbd5e1;
  border-top: 2px solid #cbd5e1;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  white-space: nowrap;
}

.restocking-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 500;
  color: #1e293b;
}

.restocking-table tr:nth-child(even) {
  background: #fafafa;
}

.restocking-table tr:hover {
  background: #f0fdfa;
  box-shadow: inset 3px 0 0 #0d9488;
}

.restocking-table tr.over-budget {
  opacity: 0.45;
}

.restocking-table tr.over-budget:hover {
  opacity: 0.6;
}

.qty-input {
  width: 85px;
  padding: 0.625rem;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 700;
  text-align: center;
  transition: all 0.3s ease;
  background: #fafafa;
}

.qty-input:focus {
  outline: none;
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
  background: white;
}

.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-data {
  text-align: center;
  padding: 3.5rem;
  color: #64748b;
  font-size: 1rem;
  font-weight: 600;
  background: white;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Dark mode */
[data-theme="dark"] .budget-control-card { background: #1e293b; border-color: #334155; }
[data-theme="dark"] .budget-label { color: #94a3b8; }
[data-theme="dark"] .budget-input { background: #0f172a; color: #e2e8f0; border-color: #334155; }
[data-theme="dark"] .budget-input:focus { border-color: #0d9488; background: #1e293b; }
[data-theme="dark"] .currency-prefix { color: #0d9488; }
[data-theme="dark"] .restocking-table th { background: #1e293b; color: #94a3b8; border-color: #334155; }
[data-theme="dark"] .restocking-table td { color: #cbd5e1; border-color: #334155; }
[data-theme="dark"] .restocking-table tr:nth-child(even) { background: rgba(255,255,255,0.02); }
[data-theme="dark"] .restocking-table tr:hover { background: rgba(13,148,136,0.1); }
[data-theme="dark"] .qty-input { background: #0f172a; color: #e2e8f0; border-color: #334155; }
[data-theme="dark"] .qty-input:focus { border-color: #0d9488; background: #1e293b; }
[data-theme="dark"] .no-data { background: #1e293b; border-color: #334155; color: #94a3b8; }
</style>
