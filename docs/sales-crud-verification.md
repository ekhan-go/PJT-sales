# CRUD · 검색 · 페이징 검증 결과

- Maven H2 통합 테스트 14개 통과 (SalesCrudHttpTests 10개 + SalesReadHttpTests 4개)
- 프론트 입력 검증 테스트 5개 통과 (npm.cmd run test:sales)
- npm.cmd run build 성공
- 별도 H2 서버/별도 Vite 포트에서 브라우저 CRUD 동작 확인
- 브라우저 확인: 거래처 등록, 상세, 수정, 삭제, 검색, 페이지 크기/이동, 마지막 행 삭제 후 페이지 보정
- 서버 저장 충돌(409) 시 입력값 유지 및 최신 데이터로 재시도 확인
- 상품/재고/거래 화면 연결 및 재고 DATE의 초 단위 보존 확인
- 모바일 상품 등록 모달과 버튼 배치 확인
- 실제 Oracle에 테스트용 DDL/INSERT/UPDATE/DELETE를 실행하지 않음
- Oracle ROWID/CHAR 변환 및 드라이버의 최종 실제 DB 동작은 별도 확인 필요
- 기존 소스 백업: C:/react-study/PJT-sales-before-crud-20261102-143227

실행/확인 방법은 docs/sales-crud.md 참고.
