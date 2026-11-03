import Card from 'react-bootstrap/Card'
import useDashboardWidget from '../../hooks/useDashboardWidget'
import { getDashboardKpi } from '../../api/dashboardApi'
import { F } from '../../constants/dashboardFields'
import { formatNumber } from '../../utils/dashboardUtils'
import WidgetState from './WidgetState'
import DashboardIcon from './DashboardIcon'
export default function KpiCard({ definition, query }) {
 const state = useDashboardWidget(getDashboardKpi, query, definition.key)
 const data = state.data, change = data?.[F.change]
 return <Card className={'dashboard-kpi kpi-' + definition.key + (definition.danger ? ' dashboard-kpi-danger' : '')}>
  <Card.Body><div className="kpi-heading"><h3>{definition.title}</h3><span className="kpi-symbol"><DashboardIcon name={definition.key} size={21} /></span></div>
   <WidgetState {...state} empty={data?.[F.value] === null || data?.[F.value] === undefined} title={definition.title}>
    <p className="kpi-number">{formatNumber(data?.[F.value])}<span>{definition.unit}</span></p>
    <div className="kpi-bottom">{definition.compare ? <div className="kpi-comparison">
     <span className={change > 0 ? 'trend-up' : change < 0 ? 'trend-down' : 'trend-flat'}>
      {change === null || change === undefined ? '비교 불가' : (change > 0 ? '▲ ' : change < 0 ? '▼ ' : '— ') + Math.abs(change).toFixed(1) + '%'}
     </span><span>{data?.[F.comparisonMonth]} 전월 대비</span>
    </div> : <p className="kpi-note">{definition.danger ? '안전재고 미만 · 보충이 필요합니다' : '선택 기간 총매출 ÷ 거래 건수'}</p>}
    <span className="kpi-scope">{definition.danger ? '현재 재고' : '선택 기간'}</span></div>
   </WidgetState>
  </Card.Body>
 </Card>
}
