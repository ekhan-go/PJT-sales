import { useEffect, useRef, useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'
import Table from 'react-bootstrap/Table'
import Pagination from 'react-bootstrap/Pagination'
import { createSalesRow, deleteSalesRow, getSalesRow, getSalesRows, updateSalesRow } from '../api/salesApi'
import { formatCell } from '../data/salesTables'
import { salesError } from '../utils/salesValidation'
import SalesFormModal from '../components/sales/SalesFormModal'
import SalesRecordModal from '../components/sales/SalesRecordModal'
import './SalesListPage.css'
const empty={content:[],totalElements:0,totalPages:0}
export default function SalesListPage({ table }) {
 const [query,setQuery]=useState({page:1,size:20,field:'all',keyword:''})
 const [field,setField]=useState('all'), [keyword,setKeyword]=useState('')
 const [revision,setRevision]=useState(0), [data,setData]=useState(empty)
 const [loading,setLoading]=useState(true), [listError,setListError]=useState('')
 const [actionError,setActionError]=useState(''), [success,setSuccess]=useState('')
 const [mode,setMode]=useState(null), [record,setRecord]=useState(null)
 const [busy,setBusy]=useState(false), [opening,setOpening]=useState(false)
 const [fieldErrors,setFieldErrors]=useState({})
 const actionRequest=useRef(null), saving=useRef(false)
 useEffect(()=>()=>actionRequest.current?.abort(),[])
 useEffect(()=>{
  const controller=new AbortController()
  setLoading(true); setListError(''); setData(empty)
  getSalesRows(table.key,query,controller.signal).then(result=>{
   if(controller.signal.aborted) return
   if(query.page>Math.max(1,result.totalPages)) { setQuery(previous=>({...previous,page:Math.max(1,result.totalPages)})); return }
   setData(result)
  }).catch(error=>{if(!controller.signal.aborted)setListError(salesError(error,'목록을 불러오지 못했습니다. 서버 연결을 확인해 주세요.'))})
    .finally(()=>{if(!controller.signal.aborted)setLoading(false)})
  return ()=>controller.abort()
 },[table.key,query,revision])
 function close(){ if(busy)return; setMode(null);setRecord(null);setActionError('');setFieldErrors({}) }
 function create(){setRecord(null);setActionError('');setFieldErrors({});setSuccess('');setMode('create')}
 async function open(row,nextMode){
  actionRequest.current?.abort()
  const controller=new AbortController(); actionRequest.current=controller
  setOpening(true);setActionError('');setFieldErrors({});setSuccess('')
  try { const latest=await getSalesRow(table.key,row._rowId,controller.signal); if(!controller.signal.aborted){setRecord(latest);setMode(nextMode)} }
  catch(error){if(!controller.signal.aborted)setActionError(salesError(error))}
  finally{if(!controller.signal.aborted)setOpening(false)}
 }
 async function save(values){
  if(saving.current)return
  saving.current=true;setBusy(true);setActionError('');setFieldErrors({})
  try {
   if(record) await updateSalesRow(table.key,record._rowId,values,record._version)
   else await createSalesRow(table.key,values)
   setSuccess(record ? '수정했습니다.' : '등록했습니다. 현재 검색 조건에 따라 목록에 표시되지 않을 수 있습니다.')
   if(!record)setQuery(previous=>({...previous,page:1}))
   setMode(null);setRecord(null);setRevision(value=>value+1)
  }catch(error){setActionError(salesError(error));setFieldErrors(error.response?.data?.fieldErrors || {})}
  finally{saving.current=false;setBusy(false)}
 }
 async function remove(){
  if(saving.current)return
  saving.current=true;setBusy(true);setActionError('')
  try {await deleteSalesRow(table.key,record._rowId,record._version);setSuccess('삭제했습니다.');setMode(null);setRecord(null);setRevision(value=>value+1)}
  catch(error){setActionError(salesError(error))}
  finally{saving.current=false;setBusy(false)}
 }
 function search(event){event.preventDefault();setSuccess('');setActionError('');setQuery(previous=>({...previous,page:1,field,keyword:keyword.trim()}))}
 function reset(){setField('all');setKeyword('');setSuccess('');setQuery(previous=>({...previous,page:1,field:'all',keyword:''}))}
 const disabled=loading||opening||busy
 const pageStart=Math.max(1,Math.min(query.page-2,Math.max(1,data.totalPages-4)))
 const pageNumbers=Array.from({length:Math.min(5,data.totalPages)},(_,i)=>pageStart+i)
 return <section aria-labelledby="list-title" className="sales-management">
  <div className="page-heading"><div><p className="eyebrow">판매관리 · {table.table}</p><h1 id="list-title">{table.title} 관리</h1><p className="page-description">{table.description}</p></div>
   <div className="sales-header-actions"><Button variant="outline-secondary" disabled={disabled} onClick={()=>setRevision(value=>value+1)}>{loading ? <><Spinner size="sm" className="me-2" />조회 중</> : '새로고침'}</Button><Button variant="primary" disabled={opening||busy} onClick={create}>+ {table.title} 등록</Button></div>
  </div>
  {success && <Alert variant="success" dismissible onClose={()=>setSuccess('')} role="status">{success}</Alert>}
  {actionError && !mode && <Alert variant="danger" role="alert">{actionError}</Alert>}
  {opening && <div className="sales-opening" role="status"><Spinner size="sm" />최신 데이터를 불러오는 중입니다.</div>}
  <div className="table-panel">
   <Form onSubmit={search} className="sales-searchbar" role="search" aria-label={table.title + ' 검색'}>
    <Form.Label htmlFor="sales-search-field" visuallyHidden>검색 항목</Form.Label><Form.Select id="sales-search-field" value={field} disabled={disabled} onChange={event=>setField(event.target.value)}><option value="all">전체 항목</option>{table.columns.map(([key,label])=><option key={key} value={key}>{label}</option>)}</Form.Select>
    <Form.Label htmlFor="sales-search-keyword" visuallyHidden>검색어</Form.Label><Form.Control id="sales-search-keyword" value={keyword} disabled={disabled} maxLength={200} onChange={event=>setKeyword(event.target.value)} placeholder="검색어를 입력하세요" />
    <Button type="submit" variant="primary" disabled={disabled}>검색</Button><Button type="button" variant="light" disabled={disabled} onClick={reset}>초기화</Button>
   </Form>
   <div className="table-toolbar"><span aria-live="polite">{loading ? '목록 조회 중' : listError ? '조회 실패' : <>총 <strong>{data.totalElements.toLocaleString('ko-KR')}</strong>건{query.keyword && <span className="sales-search-summary">검색어: {query.keyword}</span>}</>}</span>
    <div className="size-control"><label htmlFor="page-size">페이지당</label><Form.Select id="page-size" value={query.size} disabled={disabled} onChange={event=>setQuery(previous=>({...previous,size:Number(event.target.value),page:1}))}>{[10,20,50].map(value=><option key={value} value={value}>{value}건</option>)}</Form.Select></div>
   </div>
   {listError && <Alert variant="danger" className="mx-3 mt-3" role="alert">{listError}</Alert>}
   <div className="table-scroll" aria-busy={loading}>
    <Table hover className="sales-table mb-0"><thead><tr>{table.columns.map(([key,label,type])=><th scope="col" key={key} className={type === 'number' ? 'numeric' : ''}>{label}</th>)}<th scope="col" className="sales-actions-heading">관리</th></tr></thead><tbody>
     {loading ? <tr><td colSpan={table.columns.length+1} className="table-state"><div role="status"><Spinner animation="border" variant="primary" className="mb-3" /><p className="mb-0">{table.title} 목록을 불러오는 중입니다.</p></div></td></tr>
      : listError ? <tr><td colSpan={table.columns.length+1} className="table-state">새로고침을 눌러 다시 조회해 주세요.</td></tr>
      : !data.content.length ? <tr><td colSpan={table.columns.length+1} className="table-state">조회 결과가 없습니다.</td></tr>
      : data.content.map(row=><tr key={row._rowId}>{table.columns.map(([key,,type],index)=><td key={key} className={type === 'number' ? 'numeric' : ''}>{index === 0 ? <button className="sales-detail-link" disabled={disabled} onClick={()=>open(row,'detail')} aria-label={table.title + ' ' + formatCell(row[key],type) + ' 상세보기'}>{formatCell(row[key],type)}</button> : formatCell(row[key],type)}</td>)}<td><div className="sales-row-actions"><Button size="sm" variant="outline-secondary" disabled={disabled} onClick={()=>open(row,'edit')}>수정</Button><Button size="sm" variant="outline-danger" disabled={disabled} onClick={()=>open(row,'delete')}>삭제</Button></div></td></tr>)}
    </tbody></Table>
   </div>
   <nav className="page-footer" aria-label="목록 페이지"><span>{listError ? '—' : data.totalPages ? query.page : 0} / {data.totalPages} 페이지</span>
    <Pagination className="sales-pagination mb-0"><Pagination.First aria-label="첫 페이지" disabled={disabled||!!listError||query.page<=1} onClick={()=>setQuery(previous=>({...previous,page:1}))} /><Pagination.Prev aria-label="이전 페이지" disabled={disabled||!!listError||query.page<=1} onClick={()=>setQuery(previous=>({...previous,page:query.page-1}))} />
     {pageNumbers.map(page=><Pagination.Item key={page} active={page === query.page} disabled={disabled||!!listError} aria-label={page + ' 페이지'} onClick={()=>setQuery(previous=>({...previous,page}))}>{page}</Pagination.Item>)}
     <Pagination.Next aria-label="다음 페이지" disabled={disabled||!!listError||query.page>=data.totalPages} onClick={()=>setQuery(previous=>({...previous,page:query.page+1}))} /><Pagination.Last aria-label="마지막 페이지" disabled={disabled||!!listError||query.page>=data.totalPages} onClick={()=>setQuery(previous=>({...previous,page:data.totalPages}))} /></Pagination>
   </nav>
  </div>
  {(mode === 'create'||mode === 'edit') && <SalesFormModal key={mode + (record?._rowId || '')} table={table} row={record} busy={busy} error={actionError} fieldErrors={fieldErrors} onSave={save} onCancel={close} onFieldChange={key=>{setActionError('');setFieldErrors(previous=>{const next={...previous};delete next[key];return next})}} />}
  {(mode === 'detail'||mode === 'delete') && record && <SalesRecordModal table={table} row={record} mode={mode} busy={busy} error={actionError} onClose={close} onEdit={()=>setMode('edit')} onDelete={mode === 'delete' ? remove : ()=>setMode('delete')} />}
 </section>
}
