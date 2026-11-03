# 판매관리 4개 게시판 CRUD · 검색 · 페이징

react17의 입력값 유지, 검색조건/페이지 상태, 오류 표시 방식에 맞춰 PJT-sales에 적용했습니다.
별도 react18 프로젝트를 생성하지 않았습니다. 포트는 기존 React 5179 / Spring Boot 8088입니다.

## 실행/확인 방법

터미널 1 (Oracle):

    cd C:\react-study\PJT-sales
    $credential = Get-Credential -UserName scott -Message 'Oracle 비밀번호 입력'
    $env:DB_PASSWORD = $credential.GetNetworkCredential().Password
    npm.cmd run backend

이미 실행 중인 백엔드는 Ctrl+C로 종료 후 다시 실행해야 새 API가 반영됩니다.

터미널 2:

    cd C:\react-study\PJT-sales
    npm.cmd run dev

http://localhost:5179/customers 접속. 상품 /products, 재고 /stocks, 거래 /trades도 같은 방식입니다.
홈 대시보드는 여전히 더미 데이터이며, 관리 화면의 등록/수정/삭제는 실제 Oracle 테이블에 적용됩니다.

## 화면 확인 순서

1. 전체 항목 또는 특정 컬럼을 선택하고 검색어 입력 후 검색. 대소문자를 구분하지 않는 부분 검색입니다.
2. 검색/초기화/페이지당 건수 변경은 첫 페이지로 돌아갑니다. 번호 버튼/처음/이전/다음/마지막을 제공합니다.
3. 등록 버튼에서 코드와 각 값을 직접 입력합니다. 자동 번호 발급은 하지 않습니다.
4. 첫 번째 컬럼의 링크로 상세 확인, 행의 수정 버튼으로 수정 폼을 엽니다.
5. 잘못된 숫자/날짜/길이는 항목별 안내합니다. 서버 실패 시 폼을 닫거나 입력을 지우지 않습니다.
6. 삭제 버튼은 데이터와 확인 창을 먼저 표시하며, 확인 후 행 1건만 삭제합니다.
7. 수정 후 검색조건과 페이지를 유지하며, 마지막 페이지의 마지막 행 삭제 시 유효한 페이지로 보정합니다.

기존 DB의 모든 컬럼이 NULL 허용이므로 빈 항목은 null로 전달합니다.
숫자는 실제 NUMBER(p,0)에 맞춰 4/5/8자리 정수로 제한합니다. DB에 정의되지 않은 양수/유일성/FK 규칙을 임의로 추가하지 않았습니다.
VARCHAR2(26)는 우선 26자 검증을 하며 실제 DB가 BYTE 의미론이면 한글은 더 적게 들어갈 수 있습니다. 이 경우 서버 오류를 표시하고 입력은 유지합니다.
Oracle DATE는 시간까지 포함하므로 초 단위 datetime-local로 편집합니다.
거래 등록 시 재고 자동 증감, 연관 테이블의 자동 삭제/수정, 세금 계산은 하지 않습니다.

## API

목록 GET /api/sales/{table}?page=1&size=20&field=all&keyword=
테이블 키: customers / products / stocks / trades
field는 all 또는 해당 테이블의 실제 컬럼명. 검색어 최대 200자, page 1~1000000, size 1~100.
SQL 식별자는 서버 고정 목록만 사용하며 값은 바인딩합니다. %, _, !는 일반 문자로 검색합니다.
Oracle 11g ROW_NUMBER() OVER 서브쿼리만 사용하며 OFFSET/FETCH/FETCH FIRST는 사용하지 않습니다.

상세 GET /api/sales/{table}/{id}
등록 POST /api/sales/{table} : { values: { 각 컬럼: 값 } } → 201
수정 PUT /api/sales/{table}/{id} : { values: { 모든 컬럼: 값 }, version: 상세의 _version } → 200
삭제 DELETE /api/sales/{table}/{id} : { version: 상세의 _version } → 204
요청 본문 Content-Type: application/json. 각 values에는 테이블의 모든 컬럼을 포함하고 미입력은 null로 보냅니다.

## 행 식별 및 동시 수정

PK/시퀀스를 추가하지 않는 선택에 따라 Oracle ROWIDTOCHAR(ROWID)를 URL-safe Base64로 바꾼 _rowId를 반환합니다.
PUT/DELETE는 해당 ROWID를 조회해 행 잠금을 얻고, 현재 값에서 계산한 _version(SHA-256)과 요청 버전을 비교합니다.
값이 달라졌으면 409를 반환하므로 최신 변경을 덮어쓰지 않습니다. 동일 코드/동일 값의 행도 서로 다른 ROWID로 구분합니다.
_version은 충돌 확인용이며 권한 인증 수단이 아닙니다.
ROWID는 영구 PK가 아닙니다. 테이블 MOVE/재구성/내보내기·가져오기 후에는 목록을 새로 조회해야 합니다.
행이 삭제된 뒤 동일 ROWID와 동일 값으로 재생성되는 상황까지 영구적으로 구분할 수는 없습니다. 지속적인 업무 식별자가 필요하면 PK 설계를 별도로 해야 합니다.

Oracle 공식 참고:
https://docs.oracle.com/cd/E18283_01/server.112/e17118/functions025.htm
https://asktom.oracle.com/pls/asktom/f?p=100:11:0::::P11_QUESTION_ID:53140678334596

## 테스트 실행/확인 방법

    cd C:\react-study\PJT-sales
    npm.cmd run test:sales
    npm.cmd run build
    cd backend
    .\mvnw.cmd test

백엔드 테스트는 application-test.properties의 별도 H2 메모리 DB만 사용합니다.
app.sales.row-id-mode=h2는 테스트 프로필에만 있으며 H2의 _ROWID_로 흐름을 검증합니다. 일반 실행은 Oracle ROWID 방식입니다.
실제 Oracle ROWID 구문과 JDBC 동작은 H2가 그대로 재현하지 못하므로 Oracle 최종 확인은 별도로 필요합니다.
실제 Oracle에 테스트용 INSERT/UPDATE/DELETE/DDL은 실행하지 않았습니다.

## 주요 파일

- src/pages/SalesListPage.jsx / SalesListPage.css
- src/components/sales/SalesFormModal.jsx / SalesRecordModal.jsx
- src/api/salesApi.js
- src/utils/salesValidation.js / salesValidation.test.js
- backend/src/main/java/com/pjt/sales/service/SalesTableRegistry.java
- backend/src/main/java/com/pjt/sales/service/SalesReadService.java / SalesWriteService.java
- backend/src/main/java/com/pjt/sales/repository/SalesReadRepository.java
- backend/src/main/java/com/pjt/sales/controller/SalesController.java / SalesExceptionHandler.java
- backend/src/test/java/com/pjt/sales/SalesCrudHttpTests.java
