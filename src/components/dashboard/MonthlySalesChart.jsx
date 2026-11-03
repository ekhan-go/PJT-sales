import Card from 'react-bootstrap/Card'
import { BarChart, Bar, Cell, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import useDashboardWidget from '../../hooks/useDashboardWidget'
import { getMonthlySales } from '../../api/dashboardApi'
import { F } from '../../constants/dashboardFields'
import { formatNumber } from '../../utils/dashboardUtils'
import WidgetState from './WidgetState'
export default function MonthlySalesChart({ query }) {
 const state = useDashboardWidget(getMonthlySales, query)
 const rows = state.data || []
 return <Card className="dashboard-panel" id="sales-analysis"><Card.Body>
  <div className="widget-heading"><div><h2>월별 매출 추이</h2><p>선택 기간 마지막 달 기준 · 최근 12개월</p></div><span className="widget-unit">단위: 만원</span></div>
  <WidgetState {...state} empty={!rows.length} title="월별 매출">
   <div className="monthly-summary"><span>최근 12개월 누적 매출</span><strong>{formatNumber(rows.reduce((sum, row) => sum + row[F.sales], 0))}<small>원</small></strong><span className="chart-legend"><i />월별 매출<i className="legend-current" />마지막 월</span></div>
   <div className="dashboard-chart" aria-label="최근 12개월 월별 매출 막대차트">
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
     <BarChart data={rows} margin={{ top: 14, right: 8, left: 0, bottom: 4 }} accessibilityLayer>
      <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#e9edf4" />
      <XAxis dataKey={F.month} tickFormatter={value => value.slice(5) + '월'} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
      <YAxis tickFormatter={value => formatNumber(value / 10000)} tick={{ fontSize: 11 }} width={52} axisLine={false} tickLine={false} />
      <Tooltip formatter={value => [formatNumber(value) + '원', '매출']} cursor={{ fill: '#f0f4f7' }} contentStyle={{ border: '1px solid #e2e8ed', borderRadius: 12, fontSize: 12, boxShadow: '0 8px 24px #20334b12' }} />
      <Bar dataKey={F.sales} radius={[4,4,0,0]} maxBarSize={24} isAnimationActive={false}>{rows.map((row, index) => <Cell key={row[F.month]} fill={index === rows.length - 1 ? '#178775' : '#b7c5d8'} />)}</Bar>
     </BarChart>
    </ResponsiveContainer>
   </div>
   <details className="chart-details"><summary>월별 매출 데이터 보기</summary><ul>{rows.map(row => <li key={row[F.month]}>{row[F.month]}: {formatNumber(row[F.sales])}원</li>)}</ul></details>
  </WidgetState>
 </Card.Body></Card>
}
