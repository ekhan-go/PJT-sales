import { F } from '../constants/dashboardFields.js'
import { monthKey } from '../utils/dashboardUtils.js'
// 화면 시연용 가상 거래입니다. T_COST는 이 더미에서만 거래 총액으로 취급합니다.
// 실제 Oracle T_COST의 단가/총액 의미를 확정하기 전에는 이 집계식을 서버에 옮기지 마세요.
export function createDashboardMock(now = new Date()) {
 const customers = ['한빛유통', '다온상사', '새봄리테일', '정우산업', '이음커머스', '푸른마켓', '온유상사']
 const trades = []
 for (let offset = -13; offset <= 0; offset++) {
  const month = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  customers.forEach((name, customer) => {
   const count = 5 + ((offset + 14 + customer * 3) % 8)
   for (let index = 0; index < count; index++) {
    const amount = (customer === 0 ? 520000 : 490000 - customer * 53000) + ((index * 7 + offset + 14) % 9) * 16000
    trades.push({ [F.tradeId]: trades.length + 1, [F.customerCode]: customer + 1, [F.customerName]: name,
     [F.tradeDate]: monthKey(month) + '-' + String(index + 1).padStart(2, '0'), [F.tradeAmount]: amount,
     [F.productCode]: index % 5 + 1, [F.tradeQuantity]: index + 1 })
   }
  })
 }
 const stocks = [
  ['무선 바코드 스캐너', 8, 30], ['감열 라벨지 100매', 15, 30],
  ['포장용 테이프', 12, 25], ['택배 박스 M', 19, 30], ['영수증 롤 용지', 9, 15], ['완충 포장재', 42, 20],
 ].map(([name, quantity, safe], index) => ({ [F.productCode]: index + 1, [F.productName]: name,
  [F.stockQuantity]: quantity, [F.safeQuantity]: safe }))
 return { trades, stocks }
}
