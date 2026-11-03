# 홈 대시보드

React 홈 / 은 더미 데이터 기반 대시보드입니다. Oracle이나 백엔드를 실행하지 않아도 확인할 수 있습니다.

## 실행/확인 방법

    cd C:\react-study\PJT-sales
    npm.cmd run dev

http://localhost:5179/ 접속. 기간 선택 후 조회 버튼을 누르면 각 위젯이 독립적으로 다시 조회됩니다.
올해/최근3개월 KPI는 해당 기간 합계입니다. 증감은 선택 기간 마지막 월 대 직전 월의 비교이며 카드에 기준 월을 표시합니다.
월별 차트는 마지막 월 기준 최근 12개월, Top5 점유율은 상위5개 합계가 아닌 전체 거래처 매출 기준입니다.
재고는 기간과 무관한 현재 스냅샷이며 안전재고 미만만 부족 수량 내림차순으로 표시합니다.
매출 분석 바로가기는 홈의 매출 차트로 스크롤하며, 상품·재고 조회는 기존 /stocks로 이동합니다.

## API 교체 지점

src/api/dashboardApi.js 의 getDashboardKpi, getMonthlySales, getTopCustomers, getLowStock 본문을 공통 Axios 인스턴스 호출로 교체하세요.
화면과 API 호출 규약은 (query, { signal, metric }) -> Promise 데이터입니다.
query.period: thisMonth / lastMonth / last3Months / thisYear. query.revision은 재조회용 UI 값으로 실제 API 전송 시 제외하세요.
카드 4개는 metric: sales / tradeCount / averageTrade / lowStockCount를 각각 호출합니다.
집계 응답 및 실제 DB 필드명은 src/constants/dashboardFields.js 의 F에서 관리합니다.
SAFE_QTY는 실제 DB에 없는 가상 안전재고 필드이며, SHORTAGE_QTY 등 집계 별칭도 임시입니다.
실제 응답 설계 시 DB 컬럼을 추측하지 말고 백엔드 계약에 맞춰 이 파일을 수정하세요.
더미에서는 T_COST를 거래 총액으로 가정합니다. 실제 Oracle에서의 의미가 확정되기 전에는 이 집계식을 사용하지 마세요.
샘플 거래는 실행 시점의 연월을 기준으로 생성한 가상 데이터이며 오늘 이후 날짜가 포함될 수 있습니다.

## 로딩/오류/빈 상태 확인 방법

src/api/dashboardApi.js 의 MOCK_SCENARIOS에서 원하는 위젯을 success / error / empty로 바꾼 뒤 조회하세요.
예: monthly: 'error'는 월별 차트만 오류를 표시하며 다른 위젯은 정상 표시됩니다.
카드별/차트별/테이블별 별도 hook 상태와 AbortController를 사용합니다. 다시 시도는 해당 위젯만 재조회합니다.
필터를 바꾸기만 해서는 조회하지 않으며 조회 클릭 시 적용됩니다.
전월 값이 0이면 증감률을 0%로 단정하지 않고 비교 불가로 표시합니다.
더미 표시 배지가 있어 실제 운영 데이터와 구분됩니다.

## 자동 검증 방법

    npm.cmd run test:dashboard
    npm.cmd run build

## 컴포넌트

- src/pages/DashboardPage.jsx / DashboardPage.css: 필터, Bootstrap Container/Row/Col 배치, 바로가기
- src/components/dashboard/KpiCard.jsx
- src/components/dashboard/MonthlySalesChart.jsx
- src/components/dashboard/TopCustomers.jsx
- src/components/dashboard/LowStockTable.jsx
- src/components/dashboard/WidgetState.jsx: 로딩/오류/빈 상태 공통 UI
- src/hooks/useDashboardWidget.js: 각 위젯 독립 요청 및 중단/재시도
- src/data/dashboardMock.js: 가상 원본 데이터
- src/constants/dashboardFields.js: 필드명, KPI, 기간 상수

차트는 Recharts 공식 BarChart / ResponsiveContainer API를 사용합니다:
https://recharts.github.io/en-US/api/BarChart/
https://recharts.github.io/api/ResponsiveContainer/
