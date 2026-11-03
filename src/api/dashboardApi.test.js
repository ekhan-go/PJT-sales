import test from 'node:test'
import assert from 'node:assert/strict'
import { getDashboardKpi, getMonthlySales, getTopCustomers, getLowStock, MOCK_SCENARIOS } from './dashboardApi.js'
import { F } from '../constants/dashboardFields.js'
import { periodRange, monthChange } from '../utils/dashboardUtils.js'
const query = { period: 'thisMonth' }
test('기간 범위는 연도 경계에서도 올바르게 계산된다', () => {
 assert.deepEqual(periodRange('lastMonth', new Date(2026,0,10)), { start: '2025-12', end: '2025-12' })
 assert.deepEqual(periodRange('last3Months', new Date(2026,0,10)), { start: '2025-11', end: '2026-01' })
 assert.deepEqual(periodRange('thisYear', new Date(2026,10,2)), { start: '2026-01', end: '2026-11' })
 assert.equal(monthChange(20,0),null)
})
test('월별 추이, 총매출, 평균 거래액이 같은 데이터를 사용한다', async () => {
 const [sales,count,average,monthly] = await Promise.all([getDashboardKpi(query,{metric:'sales'}),getDashboardKpi(query,{metric:'tradeCount'}),getDashboardKpi(query,{metric:'averageTrade'}),getMonthlySales(query)])
 assert.equal(monthly.length,12)
 assert.equal(new Set(monthly.map(row=>row[F.month])).size,12)
 assert.equal(sales[F.value],monthly.at(-1)[F.sales])
 assert.equal(average[F.value],Math.round(sales[F.value]/count[F.value]))
 const quarter=await getDashboardKpi({period:'last3Months'},{metric:'sales'})
 assert.equal(quarter[F.value],monthly.slice(-3).reduce((sum,row)=>sum+row[F.sales],0))
})
test('Top5는 매출 내림차순이며 점유율 분모는 전체 매출이다', async () => {
 const [rows,kpi] = await Promise.all([getTopCustomers(query),getDashboardKpi(query,{metric:'sales'})])
 assert.equal(rows.length,5)
 rows.forEach((row,i)=>{
  if(i) assert.ok(rows[i-1][F.sales]>=row[F.sales])
  assert.equal(row[F.share],Math.round(row[F.sales]/kpi[F.value]*1000)/10)
 })
 assert.ok(rows.reduce((sum,row)=>sum+row[F.share],0)<100)
})
test('부족 재고 수와 알림 목록이 일치하고 부족수량 순으로 정렬된다', async () => {
 const [rows,kpi] = await Promise.all([getLowStock(query),getDashboardKpi(query,{metric:'lowStockCount'})])
 assert.equal(rows.length,kpi[F.value])
 rows.forEach((row,i)=>{
  assert.ok(row[F.shortageQuantity]>0)
  assert.equal(row[F.shortageQuantity],row[F.safeQuantity]-row[F.stockQuantity])
  if(i) assert.ok(rows[i-1][F.shortageQuantity]>=row[F.shortageQuantity])
 })
})
test('중단된 조회는 결과를 전달하지 않는다', async () => {
 const controller=new AbortController()
 const pending=getMonthlySales(query,{signal:controller.signal})
 controller.abort()
 await assert.rejects(pending,{name:'AbortError'})
})
test('한 위젯 오류가 다른 위젯의 성공을 막지 않는다', async () => {
 MOCK_SCENARIOS.monthly='error'
 try {
  const results=await Promise.allSettled([getMonthlySales(query),getTopCustomers(query)])
  assert.equal(results[0].status,'rejected')
  assert.equal(results[1].status,'fulfilled')
 } finally { MOCK_SCENARIOS.monthly='success' }
})
test('빈 결과 시나리오는 빈 상태 렌더링용 null을 반환한다', async () => {
 MOCK_SCENARIOS.stock='empty'
 try { assert.equal(await getLowStock(query),null) } finally { MOCK_SCENARIOS.stock='success' }
})
