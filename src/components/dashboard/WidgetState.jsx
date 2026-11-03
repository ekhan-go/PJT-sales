import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
export default function WidgetState({ loading, error, empty, retry, title, children }) {
 if (loading) return <div className="dashboard-widget-state" role="status"><Spinner size="sm" animation="border" /><span>{title} 불러오는 중</span></div>
 if (error) return <Alert variant="danger" role="alert" className="dashboard-error"><p>{error}</p><Button size="sm" variant="outline-danger" onClick={retry}>다시 시도</Button></Alert>
 if (empty) return <div className="dashboard-widget-state empty">조회 결과가 없습니다</div>
 return children
}
