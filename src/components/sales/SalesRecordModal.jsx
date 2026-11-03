import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import { formatCell } from '../../data/salesTables'
export default function SalesRecordModal({table,row,mode,busy,error,onClose,onEdit,onDelete}) {
 const deleting=mode === 'delete'
 return <Modal show onHide={busy ? undefined : onClose} backdrop="static" keyboard={!busy} centered className="sales-modal">
  <Modal.Header closeButton={!busy}><Modal.Title>{table.title} {deleting ? '삭제 확인' : '상세 정보'}</Modal.Title></Modal.Header>
  <Modal.Body>
   {error && <Alert variant="danger" role="alert">{error}</Alert>}
   {deleting && <p className="sales-delete-warning">아래 데이터 1건을 삭제하시겠습니까? 삭제한 데이터는 되돌릴 수 없습니다.</p>}
   <dl className="sales-record">{table.columns.map(([key,label,type]) => <div key={key}><dt>{label}</dt><dd>{formatCell(row[key],type)}</dd></div>)}</dl>
  </Modal.Body>
  <Modal.Footer><Button variant="light" disabled={busy} onClick={onClose}>{deleting ? '취소' : '닫기'}</Button>
   {deleting ? <Button variant="danger" disabled={busy} onClick={onDelete}>{busy && <Spinner size="sm" className="me-2" />}{busy ? '삭제 중' : '삭제'}</Button>
    : <><Button variant="outline-danger" disabled={busy} onClick={onDelete}>삭제</Button><Button variant="primary" disabled={busy} onClick={onEdit}>수정</Button></>}
  </Modal.Footer>
 </Modal>
}
