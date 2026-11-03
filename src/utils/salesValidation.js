export function fieldLimit(key,type) {
 if(type === 'number') return ['T_SEQ','T_QTY','S_QTY'].includes(key) ? 4 : ['P_COST','T_COST','T_TAX'].includes(key) ? 8 : 5
 return type === 'date' ? 0 : 26
}
export function initialSalesValues(table,row) {
 return Object.fromEntries(table.columns.map(([key,,type]) => {
  let value=row?.[key]
  if(value === null || value === undefined) value=''
  if(type === 'date' && value) value=String(value).replace(' ','T')
  return [key,String(value)]
 }))
}
export function validateSales(table,values) {
 const errors={}
 for(const [key,,type] of table.columns) {
  const value=String(values[key] ?? '').trim()
  if(!value) continue // Existing DB permits NULL for all sales columns.
  const limit=fieldLimit(key,type)
  if(type === 'number') {
   if(!/^[+-]?[0-9]+$/.test(value)) errors[key]='정수로 입력하세요.'
   else if(BigInt(value) >= 10n ** BigInt(limit) || BigInt(value) <= -(10n ** BigInt(limit))) errors[key]='최대 ' + limit + '자리 정수로 입력하세요.'
  } else if(type === 'date') {
   // Use round-trip component checking: JS Date alone silently normalizes invalid dates.
   const match=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value)
   if(!match) { errors[key]='올바른 날짜와 시간을 입력하세요.'; continue }
   const [year,month,day,hour,minute,second]=match.slice(1).map(value=>Number(value || 0))
   const days=new Date(Date.UTC(year,month,0)).getUTCDate()
   if(year<1 || month<1 || month>12 || day<1 || day>days || hour>23 || minute>59 || second>59) errors[key]='올바른 날짜와 시간을 입력하세요.'
  } else if([...value].length>limit) errors[key]='최대 ' + limit + '자로 입력하세요.'
 }
 return errors
}
export function salesPayload(table,values) {
 return Object.fromEntries(table.columns.map(([key]) => {
  const value=String(values[key] ?? '').trim()
  return [key,value === '' ? null : value]
 }))
}
export function salesError(error,fallback='요청을 처리하지 못했습니다. 서버 연결을 확인하세요.') {
 const message=error.response?.data?.message
 return typeof message === 'string' ? message : fallback
}
