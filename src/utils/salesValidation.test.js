import test from 'node:test'
import assert from 'node:assert/strict'
import { salesTables } from '../data/salesTables.js'
import { initialSalesValues, validateSales, salesPayload } from './salesValidation.js'
const customer=salesTables[0], product=salesTables[1], stock=salesTables[2]
test('코드와 금액의 서로 다른 자릿수 및 정수 검증',()=>{
 assert.equal(Object.keys(validateSales(product,{P_CODE:'99999',P_COST:'-99999999'})).length,0)
 assert.ok(validateSales(product,{P_CODE:'100000',P_COST:'1.1'}).P_CODE)
 assert.ok(validateSales(product,{P_COST:'1.1'}).P_COST)
 assert.ok(validateSales(stock,{S_QTY:'10000'}).S_QTY)
})
test('날짜 정규화로 잘못된 날짜를 조용히 저장하지 않는다',()=>{
 assert.ok(validateSales(stock,{S_LASTDATE:'2026-02-30T12:00'}).S_LASTDATE)
 assert.ok(validateSales(stock,{S_LASTDATE:'2026-11-02T24:00'}).S_LASTDATE)
 assert.deepEqual(validateSales(stock,{S_LASTDATE:'2024-02-29T12:34:56'}),{})
})
test('빈값과 0은 서로 구분하고 날짜 초를 유지한다',()=>{
 const values=initialSalesValues(stock,{P_CODE:0,S_QTY:null,S_LASTDATE:'2026-11-02T12:34:56'})
 const payload=salesPayload(stock,values)
 assert.equal(payload.P_CODE,'0');assert.equal(payload.S_QTY,null);assert.equal(payload.S_LASTDATE,'2026-11-02T12:34:56')
})
test('검증과 전송값 생성은 사용자의 원본 입력값을 변경하지 않는다',()=>{
 const values={C_CODE:' 001 ',C_NAME:'x'.repeat(27),C_PHONE:'010'}
 const copy={...values};assert.ok(validateSales(customer,values).C_NAME)
 salesPayload(customer,values);assert.deepEqual(values,copy)
})
test('미입력은 기존 nullable 스키마에 맞춰 null로 전달한다',()=>{
 const values=initialSalesValues(customer,null)
 assert.deepEqual(validateSales(customer,values),{})
 assert.ok(Object.values(salesPayload(customer,values)).every(value=>value === null))
})
