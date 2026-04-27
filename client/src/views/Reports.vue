<template>
  <div class="reports">
    <div class="page-header">
      <h2>{{ t('reports.title') }}</h2>
      <p>{{ t('reports.description') }}</p>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <!-- Quarterly Performance -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('reports.quarterlyPerformance') }}</h3>
        </div>
        <div class="table-container">
          <table class="reports-table">
            <thead>
              <tr>
                <th>{{ t('reports.table.quarter') }}</th>
                <th>{{ t('reports.table.totalOrders') }}</th>
                <th>{{ t('reports.table.totalRevenue') }}</th>
                <th>{{ t('reports.table.avgOrderValue') }}</th>
                <th>{{ t('reports.table.fulfillmentRate') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="q in quarterlyData" :key="q.quarter">
                <td><strong>{{ q.quarter }}</strong></td>
                <td>{{ q.total_orders }}</td>
                <td>{{ formatCurrency(q.total_revenue) }}</td>
                <td>{{ formatCurrency(q.avg_order_value) }}</td>
                <td>
                  <span :class="getFulfillmentClass(q.fulfillment_rate)">
                    {{ q.fulfillment_rate }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Monthly Trends Chart -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('reports.monthlyRevenueTrend') }}</h3>
        </div>
        <div class="chart-container">
          <div class="bar-chart">
            <div v-for="month in monthlyData" :key="month.month" class="bar-wrapper">
              <div class="bar-container">
                <div
                  class="bar"
                  :style="{ height: getBarHeight(month.revenue) + 'px' }"
                  :title="formatCurrency(month.revenue)"
                ></div>
              </div>
              <div class="bar-label">{{ translateMonth(month.month) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Month-over-Month Comparison -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('reports.monthOverMonth') }}</h3>
        </div>
        <div class="table-container">
          <table class="reports-table">
            <thead>
              <tr>
                <th>{{ t('reports.table.month') }}</th>
                <th>{{ t('reports.table.orders') }}</th>
                <th>{{ t('reports.table.revenue') }}</th>
                <th>{{ t('reports.table.change') }}</th>
                <th>{{ t('reports.table.growthRate') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(month, index) in monthlyData" :key="month.month">
                <td><strong>{{ translateMonth(month.month) }}</strong></td>
                <td>{{ month.order_count }}</td>
                <td>{{ formatCurrency(month.revenue) }}</td>
                <td>
                  <span v-if="index > 0" :class="getChangeClass(month.revenue, monthlyData[index - 1].revenue)">
                    {{ getChangeValue(month.revenue, monthlyData[index - 1].revenue) }}
                  </span>
                  <span v-else>-</span>
                </td>
                <td>
                  <span v-if="index > 0" :class="getChangeClass(month.revenue, monthlyData[index - 1].revenue)">
                    {{ getGrowthRate(month.revenue, monthlyData[index - 1].revenue) }}
                  </span>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">{{ t('reports.totalRevenueYTD') }}</div>
          <div class="stat-value">{{ formatCurrency(totalRevenue) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('reports.avgMonthlyRevenue') }}</div>
          <div class="stat-value">{{ formatCurrency(avgMonthlyRevenue) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('reports.totalOrdersYTD') }}</div>
          <div class="stat-value">{{ totalOrders }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('reports.bestPerformingQuarter') }}</div>
          <div class="stat-value">{{ bestQuarter }}</div>
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
  name: 'Reports',
  setup() {
    const { t, currentCurrency } = useI18n()
    const { selectedPeriod, selectedLocation, selectedCategory, selectedStatus, getCurrentFilters } = useFilters()
    const loading = ref(true)
    const error = ref(null)
    const quarterlyData = ref([])
    const monthlyData = ref([])

    const totalRevenue = computed(() => {
      return monthlyData.value.reduce((sum, m) => sum + m.revenue, 0)
    })

    const avgMonthlyRevenue = computed(() => {
      if (monthlyData.value.length === 0) return 0
      return totalRevenue.value / monthlyData.value.length
    })

    const totalOrders = computed(() => {
      return monthlyData.value.reduce((sum, m) => sum + m.order_count, 0)
    })

    const bestQuarter = computed(() => {
      if (quarterlyData.value.length === 0) return '-'
      const best = quarterlyData.value.reduce((best, q) =>
        q.total_revenue > best.total_revenue ? q : best
      , quarterlyData.value[0])
      return best.quarter
    })

    const maxRevenue = computed(() => {
      if (monthlyData.value.length === 0) return 0
      return Math.max(...monthlyData.value.map(m => m.revenue))
    })

    const loadData = async () => {
      try {
        loading.value = true
        error.value = null
        const filters = getCurrentFilters()

        const [quarterlyRes, monthlyRes] = await Promise.all([
          api.getQuarterlyReports(filters),
          api.getMonthlyTrends(filters)
        ])

        quarterlyData.value = quarterlyRes
        monthlyData.value = monthlyRes
      } catch (err) {
        console.error('Failed to load reports:', err)
        error.value = 'Failed to load reports: ' + err.message
      } finally {
        loading.value = false
      }
    }

    const formatCurrency = (value) => {
      return formatCurrencyUtil(value, currentCurrency.value)
    }

    const translateMonth = (monthStr) => {
      const parts = monthStr.split('-')
      const monthNum = parts[1]
      const year = parts[0]

      const monthKeyMap = {
        '01': 'jan', '02': 'feb', '03': 'mar', '04': 'apr',
        '05': 'may', '06': 'jun', '07': 'jul', '08': 'aug',
        '09': 'sep', '10': 'oct', '11': 'nov', '12': 'dec'
      }
      const key = monthKeyMap[monthNum]
      return key ? `${t('months.' + key)} ${year}` : monthStr
    }

    const getBarHeight = (revenue) => {
      if (maxRevenue.value === 0) return 0
      return (revenue / maxRevenue.value) * 200
    }

    const getFulfillmentClass = (rate) => {
      if (rate >= 90) return 'badge success'
      if (rate >= 75) return 'badge warning'
      return 'badge danger'
    }

    const getChangeValue = (current, previous) => {
      const change = current - previous
      if (change > 0) return '+' + formatCurrency(change)
      if (change < 0) return '-' + formatCurrency(Math.abs(change))
      return formatCurrency(0)
    }

    const getChangeClass = (current, previous) => {
      const change = current - previous
      if (change > 0) return 'positive-change'
      if (change < 0) return 'negative-change'
      return ''
    }

    const getGrowthRate = (current, previous) => {
      if (previous === 0) return 'N/A'
      const rate = ((current - previous) / previous) * 100
      const sign = rate > 0 ? '+' : ''
      return sign + rate.toFixed(1) + '%'
    }

    watch([selectedPeriod, selectedLocation, selectedCategory, selectedStatus], () => {
      loadData()
    })

    onMounted(loadData)

    return {
      t,
      loading,
      error,
      quarterlyData,
      monthlyData,
      totalRevenue,
      avgMonthlyRevenue,
      totalOrders,
      bestQuarter,
      formatCurrency,
      translateMonth,
      getBarHeight,
      getFulfillmentClass,
      getChangeValue,
      getChangeClass,
      getGrowthRate
    }
  }
}
</script>

<style scoped>
.reports {
  padding: 0;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #cbd5e1;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.card-title {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.reports-table {
  width: 100%;
  border-collapse: collapse;
}

.reports-table th {
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
}

.reports-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 500;
  color: #1e293b;
}

.reports-table tr:nth-child(even) {
  background: #fafafa;
}

.reports-table tr:hover {
  background: #f0fdfa;
  box-shadow: inset 3px 0 0 #0d9488;
}

.chart-container {
  padding: 2.5rem 1.5rem;
  min-height: 320px;
  background: linear-gradient(to bottom, #fafafa, #ffffff);
  border-radius: 8px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 250px;
  gap: 0.75rem;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 80px;
}

.bar-container {
  height: 200px;
  display: flex;
  align-items: flex-end;
  width: 100%;
}

.bar {
  width: 100%;
  background: linear-gradient(to top, #0d9488, #14b8a6);
  border-radius: 6px 6px 0 0;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 -2px 8px rgba(13, 148, 136, 0.3);
}

.bar:hover {
  background: linear-gradient(to top, #0f766e, #0d9488);
  transform: scaleY(1.05);
  box-shadow: 0 -4px 16px rgba(13, 148, 136, 0.5);
}

.bar-label {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #475569;
  text-align: center;
  transform: rotate(-45deg);
  white-space: nowrap;
  margin-top: 1.5rem;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #0d9488;
  border: 1px solid #cbd5e1;
  border-left: 4px solid #0d9488;
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 8px 24px rgba(13, 148, 136, 0.15);
  transform: translateY(-2px);
}

.stat-label {
  font-size: 0.813rem;
  color: #64748b;
  margin-bottom: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
  letter-spacing: -0.05em;
}

.badge {
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
}

.badge:hover {
  transform: scale(1.05);
}

.badge.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.badge.warning {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #f59e0b;
}

.badge.danger {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #ef4444;
}

.positive-change {
  color: #10b981;
  font-weight: 700;
}

.negative-change {
  color: #ef4444;
  font-weight: 700;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #64748b;
  font-weight: 600;
  font-size: 1rem;
}

.error {
  background: linear-gradient(to right, #fef2f2, #fee2e2);
  color: #991b1b;
  padding: 1.25rem;
  border-radius: 10px;
  margin: 1rem 0;
  border: 2px solid #ef4444;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}

/* Dark mode */
[data-theme="dark"] .card { background: #1e293b; border-color: #334155; }
[data-theme="dark"] .card-header { border-bottom-color: #334155; }
[data-theme="dark"] .card-title { color: #f1f5f9; }
[data-theme="dark"] .stat-card { background: #1e293b; border-color: #334155; }
[data-theme="dark"] .stat-value { color: #f1f5f9; }
[data-theme="dark"] .stat-label { color: #94a3b8; }
[data-theme="dark"] .reports-table th { background: #1e293b; color: #94a3b8; border-color: #334155; }
[data-theme="dark"] .reports-table td { color: #cbd5e1; border-color: #334155; }
[data-theme="dark"] .reports-table tr:nth-child(even) { background: rgba(255,255,255,0.02); }
[data-theme="dark"] .reports-table tr:hover { background: rgba(13,148,136,0.1); }
[data-theme="dark"] .chart-container { background: transparent; }
[data-theme="dark"] .bar-label { color: #94a3b8; }
[data-theme="dark"] .positive-change { color: #34d399; }
[data-theme="dark"] .negative-change { color: #f87171; }
[data-theme="dark"] .badge.success { background: rgba(16,185,129,0.15); color: #6ee7b7; border-color: rgba(16,185,129,0.4); }
[data-theme="dark"] .badge.warning { background: rgba(245,158,11,0.15); color: #fcd34d; border-color: rgba(245,158,11,0.4); }
[data-theme="dark"] .badge.danger { background: rgba(239,68,68,0.15); color: #fca5a5; border-color: rgba(239,68,68,0.4); }
</style>
