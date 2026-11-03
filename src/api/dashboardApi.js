import { F } from '../constants/dashboardFields.js'
import { createDashboardMock } from '../data/dashboardMock.js'
import { monthKey, monthChange, periodRange } from '../utils/dashboardUtils.js'

// 실제 API 전환 지점: 아래 네 함수의 본문을 공통 axios 인스턴스 호출로 교체합니다.
// 호출 규약: (query, { signal, ...options }) -> Promise<데이터>. DB 컬럼/별칭은 F에서 관리.
// 예: return (await api.get('/dashboard/monthly-sales', { params: query, signal })).data
export const DASHBOARD_SOURCE = 'mock'
export const MOCK_SCENARIOS = { kpi: 'success', monthly: 'success', customers: 'success', stock: 'success' }
function mockResponse(factory, signal, section) {
 return new Promise((resolve, reject) => {
  if (signal?.aborted) { reject(new DOMException('Aborted', 'AbortError')); return }
  const abort = () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')) }
  const timer = setTimeout(() => {
   signal?.removeEventListener('abort', abort)
   if (MOCK_SCENARIOS[section] === 'error') { reject(new Error('더미 데이터 조회 오류입니다. 다시 시도해 주세요.')); return }
   if (MOCK_SCENARIOS[section] === 'empty') { resolve(null); return }
   try { resolve(factory()) } catch (error) { reject(error) }
  }, { kpi: 350, monthly: 650, customers: 850, stock: 500 }[section])
  signal?.addEventListener('abort', abort, { once: true })
 })
}
function selectedTrades(query) {
 const { trades } = createDashboardMock()
 const range = periodRange(query.period)
 return { trades: trades.filter(row => row[F.tradeDate].slice(0, 7) >= range.start && row[F.tradeDate].slice(0, 7) <= range.end), range }
}
function lowStocks() {
 return createDashboardMock().stocks.map(row => ({ ...row,
  [F.shortageQuantity]: Math.max(0, row[F.safeQuantity] - row[F.stockQuantity]),
 })).filter(row => row[F.shortageQuantity] > 0).sort((a, b) => b[F.shortageQuantity] - a[F.shortageQuantity])
}
export function getDashboardKpi(query, { signal, metric } = {}) {
 return mockResponse(() => {
  const { trades, range } = selectedTrades(query)
  if (!trades.length && metric !== 'lowStockCount') return null
  const sales = trades.reduce((sum, row) => sum + row[F.tradeAmount], 0)
  const month = new Date(Number(range.end.slice(0,4)), Number(range.end.slice(5)) - 1, 1)
  const previous = monthKey(new Date(month.getFullYear(), month.getMonth() - 1, 1))
  const all = createDashboardMock().trades
  const currentRows = all.filter(row => row[F.tradeDate].startsWith(range.end))
  const previousRows = all.filter(row => row[F.tradeDate].startsWith(previous))
  const values = { sales, tradeCount: trades.length, averageTrade: trades.length ? Math.round(sales / trades.length) : 0, lowStockCount: lowStocks().length }
  const comparison = metric === 'sales'
   ? monthChange(currentRows.reduce((sum,row) => sum + row[F.tradeAmount],0), previousRows.reduce((sum,row) => sum + row[F.tradeAmount],0))
   : metric === 'tradeCount' ? monthChange(currentRows.length, previousRows.length) : null
  return { [F.value]: values[metric], [F.change]: comparison, [F.comparisonMonth]: range.end }
 }, signal, 'kpi')
}
export function getMonthlySales(query, { signal } = {}) {
 return mockResponse(() => {
  const end = periodRange(query.period).end
  const date = new Date(Number(end.slice(0,4)), Number(end.slice(5)) - 1, 1)
  const all = createDashboardMock().trades
  return Array.from({ length: 12 }, (_, index) => {
   const month = monthKey(new Date(date.getFullYear(), date.getMonth() - 11 + index, 1))
   return { [F.month]: month, [F.sales]: all.filter(row => row[F.tradeDate].startsWith(month)).reduce((sum,row) => sum + row[F.tradeAmount],0) }
  })
 }, signal, 'monthly')
}
export function getTopCustomers(query, { signal } = {}) {
 return mockResponse(() => {
  const { trades } = selectedTrades(query)
  const total = trades.reduce((sum,row) => sum + row[F.tradeAmount],0)
  const groups = new Map()
  trades.forEach(row => {
   const key = row[F.customerCode]
   const current = groups.get(key) || { [F.customerCode]: key, [F.customerName]: row[F.customerName], [F.sales]: 0 }
   current[F.sales] += row[F.tradeAmount]; groups.set(key, current)
  })
  return [...groups.values()].sort((a,b) => b[F.sales] - a[F.sales]).slice(0,5)
   .map(row => ({ ...row, [F.share]: total ? Math.round(row[F.sales] / total * 1000) / 10 : 0 }))
 }, signal, 'customers')
}
export function getLowStock(query, { signal } = {}) {
 return mockResponse(lowStocks, signal, 'stock')
}
