<template>
  <div class="app">
    <header class="top-nav">
      <div class="nav-container">
        <div class="logo">
          <h1>{{ t('nav.companyName') }}</h1>
          <span class="subtitle">{{ t('nav.subtitle') }}</span>
        </div>
        <nav class="nav-tabs">
          <router-link to="/" :class="{ active: $route.path === '/' }">
            {{ t('nav.overview') }}
          </router-link>
          <router-link to="/inventory" :class="{ active: $route.path === '/inventory' }">
            {{ t('nav.inventory') }}
          </router-link>
          <router-link to="/orders" :class="{ active: $route.path === '/orders' }">
            {{ t('nav.orders') }}
          </router-link>
          <router-link to="/spending" :class="{ active: $route.path === '/spending' }">
            {{ t('nav.finance') }}
          </router-link>
          <router-link to="/demand" :class="{ active: $route.path === '/demand' }">
            {{ t('nav.demandForecast') }}
          </router-link>
          <router-link to="/reports" :class="{ active: $route.path === '/reports' }">
            {{ t('nav.reports') }}
          </router-link>
          <router-link to="/restocking" :class="{ active: $route.path === '/restocking' }">
            {{ t('nav.restocking') }}
          </router-link>
        </nav>
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
          {{ isDark ? '☀️' : '🌙' }}
        </button>
        <LanguageSwitcher />
        <ProfileMenu
          @show-profile-details="showProfileDetails = true"
          @show-tasks="showTasks = true"
        />
      </div>
    </header>
    <FilterBar />
    <main class="main-content">
      <router-view />
    </main>

    <ProfileDetailsModal
      :is-open="showProfileDetails"
      @close="showProfileDetails = false"
    />

    <TasksModal
      :is-open="showTasks"
      :tasks="tasks"
      @close="showTasks = false"
      @add-task="addTask"
      @delete-task="deleteTask"
      @toggle-task="toggleTask"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { api } from './api'
import { useAuth } from './composables/useAuth'
import { useI18n } from './composables/useI18n'
import FilterBar from './components/FilterBar.vue'
import ProfileMenu from './components/ProfileMenu.vue'
import ProfileDetailsModal from './components/ProfileDetailsModal.vue'
import TasksModal from './components/TasksModal.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'

export default {
  name: 'App',
  components: {
    FilterBar,
    ProfileMenu,
    ProfileDetailsModal,
    TasksModal,
    LanguageSwitcher
  },
  setup() {
    const { currentUser } = useAuth()
    const { t } = useI18n()
    const showProfileDetails = ref(false)
    const showTasks = ref(false)
    const apiTasks = ref([])

    // Dark mode
    const isDark = ref(localStorage.getItem('theme') === 'dark')
    const applyTheme = () => {
      document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
    }
    const toggleTheme = () => {
      isDark.value = !isDark.value
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
      applyTheme()
    }
    applyTheme()

    // Merge mock tasks from currentUser with API tasks
    const tasks = computed(() => {
      return [...currentUser.value.tasks, ...apiTasks.value]
    })

    const loadTasks = async () => {
      try {
        apiTasks.value = await api.getTasks()
      } catch (err) {
        console.error('Failed to load tasks:', err)
      }
    }

    const addTask = async (taskData) => {
      try {
        const newTask = await api.createTask(taskData)
        // Add new task to the beginning of the array
        apiTasks.value.unshift(newTask)
      } catch (err) {
        console.error('Failed to add task:', err)
      }
    }

    const deleteTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const isMockTask = currentUser.value.tasks.some(t => t.id === taskId)

        if (isMockTask) {
          // Remove from mock tasks
          const index = currentUser.value.tasks.findIndex(t => t.id === taskId)
          if (index !== -1) {
            currentUser.value.tasks.splice(index, 1)
          }
        } else {
          // Remove from API tasks
          await api.deleteTask(taskId)
          apiTasks.value = apiTasks.value.filter(t => t.id !== taskId)
        }
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }

    const toggleTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const mockTask = currentUser.value.tasks.find(t => t.id === taskId)

        if (mockTask) {
          // Toggle mock task status
          mockTask.status = mockTask.status === 'pending' ? 'completed' : 'pending'
        } else {
          // Toggle API task
          const updatedTask = await api.toggleTask(taskId)
          const index = apiTasks.value.findIndex(t => t.id === taskId)
          if (index !== -1) {
            apiTasks.value[index] = updatedTask
          }
        }
      } catch (err) {
        console.error('Failed to toggle task:', err)
      }
    }

    onMounted(loadTasks)

    return {
      t,
      isDark,
      toggleTheme,
      showProfileDetails,
      showTasks,
      tasks,
      addTask,
      deleteTask,
      toggleTask
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #f1f5f9;
  color: #1e293b;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.top-nav {
  background: linear-gradient(to right, #0f172a, #1e293b);
  border-bottom: 2px solid #0d9488;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  padding: 0 2.5rem;
  height: 75px;
}

.nav-container > .nav-tabs {
  margin-left: auto;
  margin-right: 1.5rem;
}

.nav-container > .language-switcher {
  margin-right: 1.5rem;
}

.logo {
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.05em;
  text-transform: uppercase;
}

.subtitle {
  font-size: 0.813rem;
  color: #94a3b8;
  font-weight: 500;
  padding-left: 1rem;
  border-left: 2px solid #334155;
  letter-spacing: 0.025em;
}

.nav-tabs {
  display: flex;
  gap: 0.5rem;
}

.nav-tabs a {
  padding: 0.75rem 1.5rem;
  color: #94a3b8;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 8px;
  transition: all 0.25s ease;
  position: relative;
  letter-spacing: 0.025em;
}

.nav-tabs a:hover {
  color: #f1f5f9;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.nav-tabs a.active {
  color: #ffffff;
  background: rgba(13, 148, 136, 0.2);
  border: 1px solid #0d9488;
}

.nav-tabs a.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 3px;
  background: #0d9488;
  border-radius: 3px 3px 0 0;
}

.main-content {
  flex: 1;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 2.5rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h2 {
  font-size: 2.25rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.5rem;
  letter-spacing: -0.05em;
}

.page-header p {
  color: #475569;
  font-size: 1rem;
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.75rem;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  border-left: 4px solid #0d9488;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.stat-card:hover {
  border-color: #0d9488;
  box-shadow: 0 8px 24px rgba(13, 148, 136, 0.15);
  transform: translateY(-2px);
}

.stat-label {
  color: #64748b;
  font-size: 0.813rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.75rem;
}

.stat-value {
  font-size: 2.75rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.05em;
  line-height: 1;
}

.stat-card.warning {
  border-left-color: #f59e0b;
}

.stat-card.warning .stat-value {
  color: #f59e0b;
}

.stat-card.success {
  border-left-color: #10b981;
}

.stat-card.success .stat-value {
  color: #10b981;
}

.stat-card.danger {
  border-left-color: #ef4444;
}

.stat-card.danger .stat-value {
  color: #ef4444;
}

.stat-card.info {
  border-left-color: #0ea5e9;
}

.stat-card.info .stat-value {
  color: #0ea5e9;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  border: 1px solid #cbd5e1;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.025em;
  text-transform: uppercase;
  font-size: 1rem;
  letter-spacing: 0.5px;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
  border-top: 2px solid #cbd5e1;
  border-bottom: 2px solid #cbd5e1;
}

th {
  text-align: left;
  padding: 0.875rem 1rem;
  font-weight: 700;
  color: #334155;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

td {
  padding: 0.875rem 1rem;
  border-top: 1px solid #e2e8f0;
  color: #1e293b;
  font-size: 0.875rem;
  font-weight: 500;
}

tbody tr {
  transition: all 0.2s ease;
}

tbody tr:nth-child(even) {
  background: #fafafa;
}

tbody tr:hover {
  background: #f0fdfa;
  box-shadow: inset 3px 0 0 #0d9488;
}

.badge {
  display: inline-block;
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

.badge.info {
  background: #e0f2fe;
  color: #075985;
  border: 1px solid #0ea5e9;
}

.badge.increasing {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.badge.decreasing {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #ef4444;
}

.badge.stable {
  background: #ddd6fe;
  color: #5b21b6;
  border: 1px solid #8b5cf6;
}

.badge.high {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #ef4444;
}

.badge.medium {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #f59e0b;
}

.badge.low {
  background: #e0f2fe;
  color: #075985;
  border: 1px solid #0ea5e9;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #64748b;
  font-size: 1rem;
  font-weight: 600;
}

.error {
  background: linear-gradient(to right, #fef2f2, #fee2e2);
  border: 2px solid #ef4444;
  color: #991b1b;
  padding: 1.25rem;
  border-radius: 10px;
  margin: 1rem 0;
  font-size: 0.938rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}

/* Responsive Navigation */
@media (max-width: 1400px) {
  .nav-tabs a {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 1100px) {
  .nav-container {
    flex-wrap: wrap;
    height: auto;
    padding: 0.75rem 1.5rem;
    gap: 0.5rem;
  }

  .nav-container > .nav-tabs {
    order: 3;
    margin-left: 0;
    margin-right: 0;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 0.25rem;
  }

  .nav-container > .nav-tabs::-webkit-scrollbar {
    display: none;
  }

  .nav-tabs {
    flex-wrap: nowrap;
  }

  .nav-tabs a {
    white-space: nowrap;
    flex-shrink: 0;
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }

  .logo h1 {
    font-size: 1.1rem;
  }

  .subtitle {
    display: none;
  }
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0.5rem 1rem;
  }

  .main-content {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .nav-tabs a {
    padding: 0.4rem 0.6rem;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* Theme Toggle */
.theme-toggle {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.25s ease;
  margin-right: 0.75rem;
  line-height: 1;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* ========= DARK MODE ========= */
/* Global overrides use !important to penetrate scoped styles */
[data-theme="dark"] body {
  background: #0f172a !important;
  color: #e2e8f0 !important;
}

/* All headings */
[data-theme="dark"] h2,
[data-theme="dark"] h3,
[data-theme="dark"] h4,
[data-theme="dark"] strong {
  color: #f1f5f9 !important;
}

[data-theme="dark"] p,
[data-theme="dark"] span,
[data-theme="dark"] label,
[data-theme="dark"] div {
  color: inherit;
}

[data-theme="dark"] .page-header h2 { color: #f1f5f9 !important; }
[data-theme="dark"] .page-header p { color: #94a3b8 !important; }

/* Cards, stat cards, all white boxes */
[data-theme="dark"] .stat-card,
[data-theme="dark"] .card,
[data-theme="dark"] .kpi-card,
[data-theme="dark"] .budget-control-card,
[data-theme="dark"] .no-data {
  background: #1e293b !important;
  border-color: #334155 !important;
  color: #e2e8f0 !important;
}

[data-theme="dark"] .stat-card:hover,
[data-theme="dark"] .card:hover,
[data-theme="dark"] .kpi-card:hover {
  border-color: #0d9488 !important;
  box-shadow: 0 8px 24px rgba(13, 148, 136, 0.2) !important;
}

[data-theme="dark"] .stat-value,
[data-theme="dark"] .kpi-value {
  color: #f1f5f9 !important;
}

[data-theme="dark"] .stat-label,
[data-theme="dark"] .kpi-label,
[data-theme="dark"] .kpi-goal,
[data-theme="dark"] .budget-label {
  color: #94a3b8 !important;
}

[data-theme="dark"] .card-header {
  border-bottom-color: #334155 !important;
}

[data-theme="dark"] .card-title,
[data-theme="dark"] .section-title {
  color: #f1f5f9 !important;
}

/* Tables */
[data-theme="dark"] thead {
  background: linear-gradient(to bottom, #1e293b, #1a2536) !important;
  border-color: #334155 !important;
}

[data-theme="dark"] th {
  color: #94a3b8 !important;
  background: transparent !important;
}

[data-theme="dark"] td {
  border-color: #334155 !important;
  color: #cbd5e1 !important;
}

[data-theme="dark"] tbody tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.02) !important;
}

[data-theme="dark"] tbody tr:hover {
  background: rgba(13, 148, 136, 0.1) !important;
}

/* Filter bar */
[data-theme="dark"] .filters-bar,
[data-theme="dark"] .filter-bar {
  background: #1e293b !important;
  border-color: #334155 !important;
}

[data-theme="dark"] .filter-label,
[data-theme="dark"] .filter-group label,
[data-theme="dark"] .filter-group div:first-child {
  color: #94a3b8 !important;
}

[data-theme="dark"] select,
[data-theme="dark"] .filter-select {
  background: #0f172a !important;
  color: #e2e8f0 !important;
  border-color: #334155 !important;
}

[data-theme="dark"] select option {
  background: #1e293b;
  color: #e2e8f0;
}

[data-theme="dark"] input,
[data-theme="dark"] .budget-input,
[data-theme="dark"] .qty-input {
  background: #0f172a !important;
  color: #e2e8f0 !important;
  border-color: #334155 !important;
}

[data-theme="dark"] input:focus,
[data-theme="dark"] select:focus {
  border-color: #0d9488 !important;
}

/* Buttons */
[data-theme="dark"] button {
  color: #e2e8f0;
}

[data-theme="dark"] .reset-button,
[data-theme="dark"] button[disabled] {
  color: #64748b !important;
}

/* KPI progress bars */
[data-theme="dark"] .kpi-progress-bar {
  background: #334155 !important;
}

/* Dashboard specific: Order Health, Category bars, etc */
[data-theme="dark"] .order-health-card,
[data-theme="dark"] .category-card,
[data-theme="dark"] .two-column-grid > div,
[data-theme="dark"] .metric-card {
  background: #1e293b !important;
  border-color: #334155 !important;
}

[data-theme="dark"] .metric-label,
[data-theme="dark"] .metric-value,
[data-theme="dark"] .category-name,
[data-theme="dark"] .category-value,
[data-theme="dark"] .legend-label {
  color: #cbd5e1 !important;
}

/* Chart containers */
[data-theme="dark"] .chart-container {
  background: transparent !important;
}

/* Generic text colors for scoped components */
[data-theme="dark"] .donut-label,
[data-theme="dark"] .donut-value,
[data-theme="dark"] .bar-label {
  color: #94a3b8 !important;
}

/* Revenue, cost, profit labels in Spending */
[data-theme="dark"] .stat-meta,
[data-theme="dark"] .stat-change,
[data-theme="dark"] .transaction-vendor,
[data-theme="dark"] .transaction-date,
[data-theme="dark"] .transaction-id,
[data-theme="dark"] .percentage {
  color: #94a3b8 !important;
}

[data-theme="dark"] .transaction-description,
[data-theme="dark"] .transaction-amount,
[data-theme="dark"] .category-amount {
  color: #e2e8f0 !important;
}

[data-theme="dark"] .category-bar-container {
  background: #334155 !important;
}

[data-theme="dark"] .transactions-table thead {
  background: #1e293b !important;
}

/* Search inputs */
[data-theme="dark"] input[type="text"],
[data-theme="dark"] input[type="number"],
[data-theme="dark"] input[type="search"] {
  background: #0f172a !important;
  color: #e2e8f0 !important;
  border-color: #334155 !important;
}

/* Y-axis labels in charts */
[data-theme="dark"] .y-axis span {
  color: #64748b !important;
}

/* Revenue/cost bars keep their colors */

/* Positive/negative changes */
[data-theme="dark"] .positive-change { color: #34d399 !important; }
[data-theme="dark"] .negative-change { color: #f87171 !important; }

/* Currency prefix */
[data-theme="dark"] .currency-prefix {
  color: #0d9488 !important;
}

/* Loading and Error */
[data-theme="dark"] .loading { color: #94a3b8 !important; }
[data-theme="dark"] .error {
  background: linear-gradient(to right, #1e293b, #2d1b1b) !important;
  border-color: #ef4444 !important;
  color: #fca5a5 !important;
}

/* Badges */
[data-theme="dark"] .badge.success { background: rgba(16,185,129,0.15) !important; color: #6ee7b7 !important; border-color: rgba(16,185,129,0.4) !important; }
[data-theme="dark"] .badge.warning { background: rgba(245,158,11,0.15) !important; color: #fcd34d !important; border-color: rgba(245,158,11,0.4) !important; }
[data-theme="dark"] .badge.danger { background: rgba(239,68,68,0.15) !important; color: #fca5a5 !important; border-color: rgba(239,68,68,0.4) !important; }
[data-theme="dark"] .badge.info { background: rgba(14,165,233,0.15) !important; color: #7dd3fc !important; border-color: rgba(14,165,233,0.4) !important; }
[data-theme="dark"] .badge.increasing { background: rgba(16,185,129,0.15) !important; color: #6ee7b7 !important; border-color: rgba(16,185,129,0.4) !important; }
[data-theme="dark"] .badge.decreasing { background: rgba(239,68,68,0.15) !important; color: #fca5a5 !important; border-color: rgba(239,68,68,0.4) !important; }
[data-theme="dark"] .badge.stable { background: rgba(139,92,246,0.15) !important; color: #c4b5fd !important; border-color: rgba(139,92,246,0.4) !important; }
[data-theme="dark"] .badge.high { background: rgba(239,68,68,0.15) !important; color: #fca5a5 !important; border-color: rgba(239,68,68,0.4) !important; }
[data-theme="dark"] .badge.medium { background: rgba(245,158,11,0.15) !important; color: #fcd34d !important; border-color: rgba(245,158,11,0.4) !important; }
[data-theme="dark"] .badge.low { background: rgba(14,165,233,0.15) !important; color: #7dd3fc !important; border-color: rgba(14,165,233,0.4) !important; }

/* Language switcher and profile menu */
[data-theme="dark"] .language-dropdown,
[data-theme="dark"] .profile-dropdown {
  background: #1e293b !important;
  border-color: #334155 !important;
}

[data-theme="dark"] .language-option:hover,
[data-theme="dark"] .profile-dropdown button:hover {
  background: #334155 !important;
}

/* Modals */
[data-theme="dark"] .modal-content {
  background: #1e293b !important;
  border-color: #334155 !important;
  color: #e2e8f0 !important;
}

[data-theme="dark"] .modal-overlay {
  background: rgba(0, 0, 0, 0.7) !important;
}
</style>
