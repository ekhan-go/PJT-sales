import Card from 'react-bootstrap/Card'
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import useDashboardWidget from '../../hooks/useDashboardWidget'
import { getTopCustomers } from '../../api/dashboardApi'
import { F } from '../../constants/dashboardFields'
import { formatNumber } from '../../utils/dashboardUtils'
import WidgetState from './WidgetState'
export default function TopCustomers({ query }) {
 const state = useDashboardWidget(getTopCustomers, query)
 const rows = [...(state.data || [])].sort((a,b) => b[F.sales] - a[F.sales]).slice(0,5)
 return <Card className="dashboard-panel"><Card.Body>
  <div className="widget-heading"><div><h2>거래처별 매출 <span className="top-badge">TOP 5</span></h2><p>선택 기간 매출 · 점유율은 전체 거래처 매출 기준</p></div></div>
  <WidgetState {...state} empty={!rows.length} title="거래처별 매출">
   <div className="dashboard-customer-chart" aria-label="거래처별 매출 상위 5개 가로 막대차트">
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
     <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} accessibilityLayer>
      <XAxis type="number" hide />
      <YAxis type="category" dataKey={F.customerName} width={90} tick={{ fontSize: 12, fill: '#4b5b75' }} axisLine={false} tickLine={false} />
      <Tooltip formatter={value => [formatNumber(value) + '원', '매출']} cursor={{ fill: '#f0f4f7' }} contentStyle={{ border: '1px solid #e2e8ed', borderRadius: 12, fontSize: 12 }} />
      <Bar dataKey={F.sales} radius={[0,4,4,0]} maxBarSize={14} isAnimationActive={false}>{rows.map((row, index) => <Cell key={row[F.customerCode]} fill={index === 0 ? '#178775' : '#b7c5d8'} />)}</Bar>
     </BarChart>
    </ResponsiveContainer>
   </div>
   <div className="ranking-header"><span>거래처</span><span>매출액 / 점유율</span></div>
   <ol className="customer-ranking">{rows.map((row, index) => <li key={row[F.customerCode]}><span className={'rank-number ' + (index === 0 ? 'rank-first' : '')}>{index + 1}</span><span className="rank-customer">{row[F.customerName]}</span><strong>{formatNumber(row[F.sales])}<small>원</small></strong><span className="share-badge">{row[F.share].toFixed(1)}%</span></li>)}</ol>
  </WidgetState>
 </Card.Body></Card>
}
