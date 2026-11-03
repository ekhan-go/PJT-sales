import { useRef, useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import { fieldLimit, initialSalesValues, salesPayload, validateSales } from '../../utils/salesValidation'
export default function SalesFormModal({ table,row,busy,error,fieldErrors,onSave,onCancel,onFieldChange }) {
 const [values,setValues]=useState(() => initialSalesValues(table,row))
 const [errors,setErrors]=useState({})
 const sending=useRef(false)
 const refs=useRef({})
 const visibleErrors={...fieldErrors,...errors}
 async function submit(event) {
  event.preventDefault()
  if(busy || sending.current) return
  const next=validateSales(table,values); setErrors(next)
  const first=Object.keys(next)[0]
  if(first) { refs.current[first]?.focus(); return }
  sending.current=true
  try { await onSave(salesPayload(table,values)) } finally { sending.current=false }
 }
 function change(key,value) {
  setValues(previous=>({...previous,[key]:value}))
  setErrors(previous=>{ const next={...previous}; delete next[key]; return next })
  onFieldChange(key)
 }
 return <Modal show onHide={busy ? undefined : onCancel} backdrop="static" keyboard={!busy} centered size="lg" className="sales-modal">
  <Modal.Header closeButton={!busy}><Modal.Title>{table.title} {row ? '수정' : '등록'}</Modal.Title></Modal.Header>
  <Form noValidate onSubmit={submit} aria-busy={busy}>
   <Modal.Body>
    <p className="sales-form-help">코드는 직접 입력하고, 사용하지 않는 항목은 비워 두세요.</p>
    {error && <Alert variant="danger" role="alert">{error}</Alert>}
    <Row className="g-3">{table.columns.map(([key,label,type],index) => <Col xs={12} md={key === 'C_ADDR' ? 12 : 6} key={key}>
     <Form.Group controlId={'sales-field-' + key}>
      <Form.Label>{label}</Form.Label>
      <Form.Control ref={node=>{refs.current[key]=node}} type={type === 'date' ? 'datetime-local' : 'text'}
       inputMode={type === 'number' ? 'text' : undefined} step={type === 'date' ? '1' : undefined}
       value={values[key]} disabled={busy} isInvalid={!!visibleErrors[key]} aria-invalid={!!visibleErrors[key]} autoFocus={index === 0}
       aria-describedby={key + '-help' + (visibleErrors[key] ? ' ' + key + '-error' : '')}
       onChange={event=>change(key,event.target.value)} />
      <Form.Text id={key + '-help'}>{type === 'number' ? '최대 ' + fieldLimit(key,type) + '자리 정수' : type === 'date' ? '날짜와 시간 (초 단위)' : '최대 ' + fieldLimit(key,type) + '자'}</Form.Text>
      <Form.Control.Feedback id={key + '-error'} type="invalid" role="alert">{visibleErrors[key]}</Form.Control.Feedback>
     </Form.Group>
    </Col>)}</Row>
   </Modal.Body>
   <Modal.Footer><Button variant="light" onClick={onCancel} disabled={busy}>취소</Button><Button type="submit" variant="primary" disabled={busy}>{busy && <Spinner size="sm" className="me-2" />}{busy ? '저장 중' : row ? '수정 저장' : '등록'}</Button></Modal.Footer>
  </Form>
 </Modal>
}
