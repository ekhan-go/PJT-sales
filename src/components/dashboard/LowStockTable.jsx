import Card from 'react-bootstrap/Card'
import Table from 'react-bootstrap/Table'
import Badge from 'react-bootstrap/Badge'
import useDashboardWidget from '../../hooks/useDashboardWidget'
import { getLowStock } from '../../api/dashboardApi'
import { F } from '../../constants/dashboardFields'
import { formatNumber } from '../../utils/dashboardUtils'
import WidgetState from './WidgetState'
import DashboardIcon from './DashboardIcon'
export default function LowStockTable({ query }) {
 const state = useDashboardWidget(getLowStock, query)
 const rows = [...(state.data || [])].sort((a,b) => b[F.shortageQuantity] - a[F.shortageQuantity])
 return <Card className="dashboard-panel low-stock-panel"><Card.Body>
  <div className="widget-heading"><div><h2>재고 부족 알림 <Badge bg="danger">{state.loading || state.error ? '—' : rows.length}</Badge></h2><p>현재 재고 기준 · 부족 수량이 많은 순</p></div><span className="stock-status"><DashboardIcon name="lowStockCount" size={14} />보충 필요</span></div>
  <WidgetState {...state} empty={!rows.length} title="재고 부족 알림">
   <Table responsive className="low-stock-table"><thead><tr><th>상품명</th><th className="text-end">현재고</th><th className="text-end">안전재고</th><th className="text-end">부족수량</th></tr></thead>
    <tbody>{rows.map(row => <tr key={row[F.productCode]}><td><div className="stock-product"><span className="stock-product-icon"><DashboardIcon name="stocks" size={19} /></span><div><strong>{row[F.productName]}</strong><small>상품 코드 {String(row[F.productCode]).padStart(3, '0')}</small></div></div></td><td className="text-end">{formatNumber(row[F.stockQuantity])}</td><td className="text-end">{formatNumber(row[F.safeQuantity])}</td><td className="text-end shortage"><span className="shortage-pill">{formatNumber(row[F.shortageQuantity])}<small>개 부족</small></span></td></tr>)}</tbody>
   </Table>
  </WidgetState>
 </Card.Body></Card>
}
