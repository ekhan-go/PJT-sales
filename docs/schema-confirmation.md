# SQL Developer 확인 결과
CUSTOMER(C_CODE NUMBER(5), C_NAME/C_CEO/C_ADDR/C_PHONE VARCHAR2(26))
PRODUCT(P_CODE NUMBER(5), P_NAME/P_GROUP VARCHAR2(26), P_COST NUMBER(8))
STOCK(P_CODE NUMBER(5), S_QTY NUMBER(4), S_LASTDATE DATE)
TRADE(T_SEQ NUMBER(4), P_CODE/C_CODE NUMBER(5), T_DATE DATE, T_QTY NUMBER(4), T_COST/T_TAX NUMBER(8))
모든 컬럼 NULL 허용. 4개 테이블에 등록된 PK와 트리거가 없습니다.
시퀀스 조회 결과는 BOARD14_SEQ, PH_ENTRY_SEQ, PH_USER_SEQ로 판매관리용 시퀀스는 확인되지 않았습니다.
현재 CRUD는 EntityManager 네이티브 SQL과 Oracle ROWID로 행을 식별합니다. 임의의 @Id, PK, 시퀀스는 추가하지 않습니다. 코드는 직접 입력합니다. 상세는 sales-crud.md 참고.
화면의 T_COST/T_TAX는 원본 값을 표시하며 매출 계산에는 사용하지 않습니다.
추후 등록/수정/삭제 및 매출 집계 전에 고유 키/PK/시퀀스와 T_COST의 단가/총액 의미를 확인해야 합니다.
