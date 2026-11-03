export function monthKey(date) { return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') }
export function periodRange(period, now = new Date()) {
 const year = now.getFullYear(), month = now.getMonth()
 const end = new Date(year, month + (period === 'lastMonth' ? 0 : 1), 0)
 const start = new Date(year, period === 'thisYear' ? 0 : month - (period === 'last3Months' ? 2 : period === 'lastMonth' ? 1 : 0), 1)
 return { start: monthKey(start), end: monthKey(end) }
}
export function formatNumber(value) { return value === null || value === undefined || !Number.isFinite(Number(value)) ? '—' : Number(value).toLocaleString('ko-KR', { maximumFractionDigits: 0 }) }
export function monthChange(current, previous) { return previous === 0 ? null : Math.round((current - previous) / previous * 1000) / 10 }
