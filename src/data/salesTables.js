export const salesTables = [
 { key: 'customers', table: 'CUSTOMER', title: '거래처', description: '거래처 정보를 검색하고 등록·수정·삭제합니다.', columns: [['C_CODE','거래처 코드','number'],['C_NAME','거래처명'],['C_CEO','대표자'],['C_ADDR','주소'],['C_PHONE','전화번호']] },
 { key: 'products', table: 'PRODUCT', title: '상품', description: '상품과 가격, 분류 정보를 관리합니다.', columns: [['P_CODE','상품 코드','number'],['P_NAME','상품명'],['P_COST','가격','number'],['P_GROUP','분류']] },
 { key: 'stocks', table: 'STOCK', title: '재고', description: '상품별 재고 수량과 최종 일자를 관리합니다.', columns: [['P_CODE','상품 코드','number'],['S_QTY','재고 수량','number'],['S_LASTDATE','최종 일자','date']] },
 { key: 'trades', table: 'TRADE', title: '거래', description: '거래 내역과 수량, 금액을 관리합니다.', columns: [['T_SEQ','거래 번호','number'],['P_CODE','상품 코드','number'],['C_CODE','거래처 코드','number'],['T_DATE','거래 일자','date'],['T_QTY','수량','number'],['T_COST','거래 금액','number'],['T_TAX','세금','number']] },
]
export function formatCell(value, type) {
 if (value === null || value === undefined || value === '') return '—'
 if (type === 'number') return Number(value).toLocaleString('ko-KR')
 if (type === 'date') return String(value).replace('T', ' ')
 return String(value)
}
