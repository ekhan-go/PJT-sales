// 실제 DB 컬럼과 대시보드 응답 별칭을 이 파일에서 관리합니다.
// SAFE_QTY는 현 DB에 없는 임시 안전재고 필드입니다. 아래 집계 별칭도 API 확정 후 변경하세요.
export const F = Object.freeze({
 customerCode: 'C_CODE', customerName: 'C_NAME', productCode: 'P_CODE', productName: 'P_NAME',
 tradeId: 'T_SEQ', tradeDate: 'T_DATE', tradeQuantity: 'T_QTY', tradeAmount: 'T_COST',
 stockQuantity: 'S_QTY', safeQuantity: 'SAFE_QTY', shortageQuantity: 'SHORTAGE_QTY',
 month: 'SALES_MONTH', sales: 'TOTAL_SALES', tradeCount: 'TRADE_COUNT',
 averageTrade: 'AVG_TRADE_AMOUNT', lowStockCount: 'LOW_STOCK_COUNT', share: 'SALES_SHARE',
 value: 'VALUE', change: 'MOM_CHANGE_RATE', comparisonMonth: 'COMPARISON_MONTH',
})
export const PERIODS = Object.freeze([
 { value: 'thisMonth', label: '이번달' }, { value: 'lastMonth', label: '지난달' },
 { value: 'last3Months', label: '최근3개월' }, { value: 'thisYear', label: '올해' },
])
export const KPI_DEFINITIONS = Object.freeze([
 { key: 'sales', title: '총매출', unit: '원', compare: true, icon: '₩' },
 { key: 'tradeCount', title: '거래 건수', unit: '건', compare: true, icon: '↔' },
 { key: 'averageTrade', title: '평균 거래액', unit: '원', icon: '≈' },
 { key: 'lowStockCount', title: '재고 부족 상품 수', unit: '개', danger: true, icon: '!' },
])
