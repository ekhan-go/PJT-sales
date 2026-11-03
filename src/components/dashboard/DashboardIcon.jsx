const paths = {
 sales: <><path d="m4 5 4 14 4-14 4 14 4-14M2 10h20M2 14h20" /></>,
 tradeCount: <><path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4" /></>,
 averageTrade: <><path d="M4 18V9m8 9V4m8 14v-6M2 21h20" /></>,
 lowStockCount: <><path d="m12 3 10 18H2L12 3Z" /><path d="M12 9v5m0 3h.01" /></>,
 calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2" /></>,
 arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
 customers: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-16a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 5" /></>,
 stocks: <><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 5v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5" /></>,
 trades: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h6M9 11h6M9 15h3" /></>,
 analysis: <><path d="M3 3v18h18M7 14l4-4 4 3 6-8m-5 0h5v5" /></>,
}
export default function DashboardIcon({ name, size = 22, ...props }) {
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>{paths[name] || paths.analysis}</svg>
}
