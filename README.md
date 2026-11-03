# 판매관리 시스템 PJT-sales

React 18 / Bootstrap 5 / React Bootstrap / Axios / Recharts / Vite.
Spring Boot 4.1.1 / Java 17 / Maven / JPA EntityManager / Oracle 11g.
React 포트 5179, 백엔드 포트 8088, 패키지 com.pjt.sales.

## 화면

- / : 더미 데이터 기반 매출 대시보드 (백엔드 없이 확인 가능)
- /customers : CUSTOMER 거래처 CRUD / 검색 / 페이징
- /products : PRODUCT 상품 CRUD / 검색 / 페이징
- /stocks : STOCK 재고 CRUD / 검색 / 페이징
- /trades : TRADE 거래 CRUD / 검색 / 페이징

관리 화면은 실제 DB 데이터를 사용합니다. 홈 대시보드는 더미 데이터입니다.
기존 Oracle 스키마/PK/시퀀스는 변경하지 않았습니다. ROWID로 행을 구분하고 코드를 직접 입력합니다.

## 설치/실행/확인 방법

    cd C:\react-study\PJT-sales
    npm.cmd install
    npm.cmd run dev

http://localhost:5179 접속.
별도 터미널에서 Oracle 비밀번호를 세션 환경변수로 설정합니다:

    cd C:\react-study\PJT-sales
    $credential = Get-Credential -UserName scott -Message 'Oracle 비밀번호 입력'
    $env:DB_PASSWORD = $credential.GetNetworkCredential().Password
    npm.cmd run backend

이미 실행 중인 백엔드는 종료 후 다시 실행해야 새 API가 반영됩니다.
DB_URL, DB_USERNAME, DB_PASSWORD, SERVER_PORT, FRONTEND_ORIGIN은 환경변수로 재정의할 수 있습니다.
.env 파일 자동 로드는 하지 않습니다. 스키마 자동 생성/변경 및 초기 데이터 입력은 비활성화했습니다.

## GitHub Pages 연결 복구 및 배포

1. 백엔드를 실행한 PC에서 `npm.cmd run check:connection`으로 Oracle 연결을 확인합니다. 실패하면 백엔드 콘솔의 Oracle 오류와 DB_URL, DB_USERNAME, DB_PASSWORD를 확인하세요. DB 비밀번호는 파일이나 GitHub에 저장하지 않습니다.
2. 백엔드가 정상이라면 `cloudflared tunnel --url http://localhost:8088`을 실행하고 터널을 유지합니다. PC가 꺼지거나 터널이 종료되면 배포 사이트도 API를 사용할 수 없습니다.
3. GitHub 저장소 Settings → Secrets and variables → Actions → Variables에서 `VITE_API_BASE_URL`을 발급된 `https://...trycloudflare.com/api`로 설정합니다. 임시 터널을 다시 만들면 주소가 바뀔 수 있습니다. 지속 운영에는 고정 주소의 터널 또는 상시 실행 백엔드를 사용하세요.
4. Actions에서 **Deploy React to GitHub Pages**를 다시 실행합니다. 주소는 빌드 시 반영되므로 변수만 변경하면 기존 사이트에는 반영되지 않습니다.

배포 전 검사에서 API 응답, 실제 DB 연결, `https://ekhan-go.github.io`의 CORS 허용을 확인합니다. 실패하면 배포를 중단하고 기존 배포를 유지합니다. 외부 API를 직접 검사하려면 `npm.cmd run check:connection -- https://백엔드주소/api`를 실행하세요.

CORS 기본 허용 주소는 `http://localhost:5179,https://ekhan-go.github.io`입니다. FRONTEND_ORIGIN을 별도로 지정했다면 기본값을 덮어쓰므로 두 주소를 쉼표로 구분해 설정하고 백엔드를 재시작하세요. 경로(`/PJT-sales/`)는 Origin에 포함하지 않습니다.

## 테스트/확인 방법

    npm.cmd run test:dashboard
    npm.cmd run test:sales
    npm.cmd run build
    cd backend
    .\mvnw.cmd test

백엔드 테스트는 H2 전용 프로필로만 실행됩니다. Oracle 데이터는 테스트에서 변경하지 않습니다.

## 설명

- docs/sales-crud.md: CRUD·검색·페이징 API, ROWID 방식의 범위, 테스트 방법
- docs/dashboard.md: 더미 대시보드와 실제 API 교체 지점
- docs/dashboard-design.md: 디자인 구성
- docs/schema-confirmation.md: SQL Developer에서 확인한 컬럼/PK 상태
