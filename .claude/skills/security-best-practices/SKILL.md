---
name: security-best-practices
description: Implement Snowflake security best practices. Use when configuring access control, RBAC, network policies, data masking, row access policies, or auditing. Handles Snowflake RBAC hierarchy, encryption, MFA, session policies, and compliance requirements.
metadata:
  tags: security, Snowflake, RBAC, masking-policy, network-policy, row-access-policy, audit
  platforms: Claude
---


# Snowflake Security Best Practices


## When to use this skill

- **New project**: Snowflake 환경 초기 보안 구성
- **Access control**: RBAC 역할 계층 설계 및 권한 관리
- **Data protection**: 민감 데이터 마스킹, 행 수준 보안
- **Network security**: IP 제한, 프라이빗 연결 구성
- **Compliance**: GDPR, HIPAA, PCI-DSS 등 컴플라이언스 요구사항 충족
- **Security audit**: 기존 보안 설정 점검 및 강화

## Instructions

### Step 1: RBAC 역할 계층 설계

Snowflake의 역할 기반 접근 제어(RBAC)를 설계한다.

**핵심 원칙**:
- 최소 권한 원칙 (Principle of Least Privilege)
- 시스템 역할 분리: `ACCOUNTADMIN`, `SECURITYADMIN`, `SYSADMIN`, `USERADMIN`
- 커스텀 역할은 `SYSADMIN`에 GRANT하여 계층 유지

**Tasks**:
- 기능별 커스텀 역할 생성
- 역할 계층 구조 설계
- 사용자-역할 매핑

**Example**:
```sql
-- 커스텀 역할 생성
CREATE ROLE EDU_ADMIN;        -- 교육 데이터 관리자
CREATE ROLE EDU_ANALYST;      -- 분석가 (읽기 전용)
CREATE ROLE EDU_DATA_ENGINEER; -- 데이터 엔지니어 (ETL)
CREATE ROLE EDU_APP_SERVICE;  -- 애플리케이션 서비스 계정

-- 역할 계층 구성 (상위 역할이 하위 역할 권한 상속)
GRANT ROLE EDU_ANALYST TO ROLE EDU_DATA_ENGINEER;
GRANT ROLE EDU_DATA_ENGINEER TO ROLE EDU_ADMIN;
GRANT ROLE EDU_ADMIN TO ROLE SYSADMIN;  -- SYSADMIN 계층에 연결 필수

-- 역할별 권한 부여
-- Analyst: 분석 스키마 읽기 전용
GRANT USAGE ON DATABASE EDU_ANALYTICS TO ROLE EDU_ANALYST;
GRANT USAGE ON SCHEMA EDU_ANALYTICS.ANALYTICS TO ROLE EDU_ANALYST;
GRANT SELECT ON ALL TABLES IN SCHEMA EDU_ANALYTICS.ANALYTICS TO ROLE EDU_ANALYST;
GRANT SELECT ON FUTURE TABLES IN SCHEMA EDU_ANALYTICS.ANALYTICS TO ROLE EDU_ANALYST;

-- Data Engineer: RAW/STAGING 스키마 쓰기
GRANT USAGE ON SCHEMA EDU_ANALYTICS.RAW TO ROLE EDU_DATA_ENGINEER;
GRANT USAGE ON SCHEMA EDU_ANALYTICS.STAGING TO ROLE EDU_DATA_ENGINEER;
GRANT CREATE TABLE ON SCHEMA EDU_ANALYTICS.RAW TO ROLE EDU_DATA_ENGINEER;
GRANT CREATE TABLE ON SCHEMA EDU_ANALYTICS.STAGING TO ROLE EDU_DATA_ENGINEER;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA EDU_ANALYTICS.RAW TO ROLE EDU_DATA_ENGINEER;

-- App Service: 특정 테이블만 읽기
GRANT SELECT ON TABLE EDU_ANALYTICS.ANALYTICS.STUDENTS TO ROLE EDU_APP_SERVICE;
GRANT SELECT ON TABLE EDU_ANALYTICS.ANALYTICS.COURSES TO ROLE EDU_APP_SERVICE;
GRANT SELECT ON TABLE EDU_ANALYTICS.ANALYTICS.ENROLLMENTS TO ROLE EDU_APP_SERVICE;

-- Warehouse 접근 제어
GRANT USAGE ON WAREHOUSE ANALYTICS_WH TO ROLE EDU_ANALYST;
GRANT USAGE ON WAREHOUSE TRANSFORM_WH TO ROLE EDU_DATA_ENGINEER;
GRANT USAGE ON WAREHOUSE APP_WH TO ROLE EDU_APP_SERVICE;

-- 사용자에 역할 부여
GRANT ROLE EDU_ANALYST TO USER analyst_user;
GRANT ROLE EDU_DATA_ENGINEER TO USER etl_user;
```

**역할 계층 다이어그램**:
```
ACCOUNTADMIN
├── SECURITYADMIN (역할/사용자 관리)
├── USERADMIN (사용자 생성)
└── SYSADMIN (오브젝트 관리)
    └── EDU_ADMIN
        └── EDU_DATA_ENGINEER
            └── EDU_ANALYST
    └── EDU_APP_SERVICE
```

### Step 2: Network Policies 구성

IP 기반 접근 제한으로 네트워크 수준 보안을 강화한다.

**Example**:
```sql
-- Network Policy 생성: 허용 IP만 접근
CREATE NETWORK POLICY EDU_NETWORK_POLICY
    ALLOWED_IP_LIST = (
        '10.0.0.0/8',           -- 내부 네트워크
        '203.0.113.0/24',       -- 오피스 IP 대역
        '198.51.100.50/32'      -- VPN Gateway
    )
    BLOCKED_IP_LIST = (
        '203.0.113.99/32'       -- 차단할 특정 IP
    );

-- 계정 전체에 Network Policy 적용
ALTER ACCOUNT SET NETWORK_POLICY = EDU_NETWORK_POLICY;

-- 특정 사용자에게만 별도 Policy 적용
CREATE NETWORK POLICY SERVICE_ACCOUNT_POLICY
    ALLOWED_IP_LIST = ('10.0.1.0/24');

ALTER USER etl_service SET NETWORK_POLICY = SERVICE_ACCOUNT_POLICY;

-- Network Policy 확인
DESCRIBE NETWORK POLICY EDU_NETWORK_POLICY;
```

### Step 3: Dynamic Data Masking

민감 데이터를 역할 기반으로 동적 마스킹한다.

**Example**:
```sql
-- 이메일 마스킹 정책
CREATE MASKING POLICY EDU_ANALYTICS.COMMON.EMAIL_MASK AS
    (VAL VARCHAR) RETURNS VARCHAR ->
    CASE
        WHEN CURRENT_ROLE() IN ('EDU_ADMIN', 'ACCOUNTADMIN')
            THEN VAL
        WHEN CURRENT_ROLE() = 'EDU_DATA_ENGINEER'
            THEN REGEXP_REPLACE(VAL, '(.{2})(.*)(@.*)', '\\1***\\3')
        ELSE '***@***.***'
    END;

-- 이름 부분 마스킹 정책
CREATE MASKING POLICY EDU_ANALYTICS.COMMON.NAME_MASK AS
    (VAL VARCHAR) RETURNS VARCHAR ->
    CASE
        WHEN CURRENT_ROLE() IN ('EDU_ADMIN', 'ACCOUNTADMIN')
            THEN VAL
        ELSE CONCAT(LEFT(VAL, 1), '***')
    END;

-- VARIANT 내부 필드 마스킹 (JSON 프로필의 phone 필드)
CREATE MASKING POLICY EDU_ANALYTICS.COMMON.VARIANT_PII_MASK AS
    (VAL VARIANT) RETURNS VARIANT ->
    CASE
        WHEN CURRENT_ROLE() IN ('EDU_ADMIN', 'ACCOUNTADMIN')
            THEN VAL
        ELSE OBJECT_DELETE(VAL, 'phone', 'address', 'ssn')
    END;

-- 테이블에 마스킹 정책 적용
ALTER TABLE EDU_ANALYTICS.ANALYTICS.STUDENTS
    MODIFY COLUMN EMAIL SET MASKING POLICY EDU_ANALYTICS.COMMON.EMAIL_MASK;

ALTER TABLE EDU_ANALYTICS.ANALYTICS.STUDENTS
    MODIFY COLUMN NAME SET MASKING POLICY EDU_ANALYTICS.COMMON.NAME_MASK;

ALTER TABLE EDU_ANALYTICS.ANALYTICS.STUDENTS
    MODIFY COLUMN PROFILE SET MASKING POLICY EDU_ANALYTICS.COMMON.VARIANT_PII_MASK;
```

### Step 4: Row Access Policies

행 수준 보안으로 데이터 접근 범위를 제한한다.

**Example**:
```sql
-- 학과별 데이터 접근 제한
-- 매핑 테이블: 역할-학과 매핑
CREATE TABLE EDU_ANALYTICS.COMMON.ROLE_DEPARTMENT_MAPPING (
    ROLE_NAME VARCHAR(100),
    DEPARTMENT_ID NUMBER
);

INSERT INTO EDU_ANALYTICS.COMMON.ROLE_DEPARTMENT_MAPPING VALUES
    ('CS_DEPT_ANALYST', 1),
    ('MATH_DEPT_ANALYST', 2),
    ('EDU_ADMIN', NULL);  -- NULL = 전체 접근

-- Row Access Policy 생성
CREATE ROW ACCESS POLICY EDU_ANALYTICS.COMMON.DEPARTMENT_ACCESS AS
    (DEPT_ID NUMBER) RETURNS BOOLEAN ->
    CURRENT_ROLE() IN ('EDU_ADMIN', 'ACCOUNTADMIN')
    OR EXISTS (
        SELECT 1 FROM EDU_ANALYTICS.COMMON.ROLE_DEPARTMENT_MAPPING
        WHERE ROLE_NAME = CURRENT_ROLE()
        AND (DEPARTMENT_ID = DEPT_ID OR DEPARTMENT_ID IS NULL)
    );

-- 테이블에 적용
ALTER TABLE EDU_ANALYTICS.ANALYTICS.STUDENTS
    ADD ROW ACCESS POLICY EDU_ANALYTICS.COMMON.DEPARTMENT_ACCESS
    ON (DEPARTMENT_ID);
```

### Step 5: MFA 및 사용자 보안

다중 인증과 사용자 보안 설정을 강화한다.

**Example**:
```sql
-- MFA 필수화 (관리자 계정)
ALTER USER admin_user SET MINS_TO_BYPASS_MFA = 0;

-- 비밀번호 정책 생성
CREATE PASSWORD POLICY EDU_PASSWORD_POLICY
    PASSWORD_MIN_LENGTH = 14
    PASSWORD_MAX_LENGTH = 256
    PASSWORD_MIN_UPPER_CASE_CHARS = 1
    PASSWORD_MIN_LOWER_CASE_CHARS = 1
    PASSWORD_MIN_NUMERIC_CHARS = 1
    PASSWORD_MIN_SPECIAL_CHARS = 1
    PASSWORD_MAX_AGE_DAYS = 90
    PASSWORD_MAX_RETRIES = 5
    PASSWORD_LOCKOUT_TIME_MINS = 30
    PASSWORD_HISTORY = 12;

-- 계정에 비밀번호 정책 적용
ALTER ACCOUNT SET PASSWORD POLICY = EDU_PASSWORD_POLICY;

-- 세션 정책 설정
CREATE SESSION POLICY EDU_SESSION_POLICY
    SESSION_IDLE_TIMEOUT_MINS = 30
    SESSION_UI_IDLE_TIMEOUT_MINS = 15;

ALTER ACCOUNT SET SESSION POLICY = EDU_SESSION_POLICY;

-- 서비스 계정: Key Pair 인증 (비밀번호 대신)
-- RSA 키 생성 후:
ALTER USER etl_service SET RSA_PUBLIC_KEY = 'MIIBIjANBg...';
ALTER USER etl_service SET PASSWORD = NULL;  -- 비밀번호 비활성화
```

### Step 6: 감사 및 모니터링

보안 이벤트를 추적하고 모니터링한다.

**Example**:
```sql
-- 로그인 이력 조회
SELECT USER_NAME, CLIENT_IP, REPORTED_CLIENT_TYPE,
       FIRST_AUTHENTICATION_FACTOR, IS_SUCCESS,
       ERROR_CODE, ERROR_MESSAGE
FROM SNOWFLAKE.ACCOUNT_USAGE.LOGIN_HISTORY
WHERE EVENT_TIMESTAMP > DATEADD(DAY, -7, CURRENT_TIMESTAMP())
AND IS_SUCCESS = 'NO'
ORDER BY EVENT_TIMESTAMP DESC;

-- 접근 이력 조회 (누가 어떤 데이터에 접근했는지)
SELECT USER_NAME, QUERY_ID,
       DIRECT_OBJECTS_ACCESSED,
       BASE_OBJECTS_ACCESSED,
       OBJECTS_MODIFIED
FROM SNOWFLAKE.ACCOUNT_USAGE.ACCESS_HISTORY
WHERE QUERY_START_TIME > DATEADD(DAY, -1, CURRENT_TIMESTAMP())
ORDER BY QUERY_START_TIME DESC;

-- 권한 변경 이력
SELECT QUERY_TEXT, USER_NAME, ROLE_NAME, EXECUTION_STATUS
FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY
WHERE QUERY_TYPE IN ('GRANT', 'REVOKE')
AND START_TIME > DATEADD(DAY, -30, CURRENT_TIMESTAMP())
ORDER BY START_TIME DESC;

-- 비정상 접근 탐지: 업무 시간 외 접근
SELECT USER_NAME, COUNT(*) AS OFF_HOURS_QUERIES,
       MIN(START_TIME) AS FIRST_QUERY, MAX(START_TIME) AS LAST_QUERY
FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY
WHERE HOUR(START_TIME) NOT BETWEEN 8 AND 20  -- 업무 시간 외
AND START_TIME > DATEADD(DAY, -7, CURRENT_TIMESTAMP())
GROUP BY USER_NAME
HAVING COUNT(*) > 10
ORDER BY OFF_HOURS_QUERIES DESC;

-- Resource Monitor로 비용 이상 탐지
CREATE RESOURCE MONITOR EDU_MONITOR
    WITH CREDIT_QUOTA = 100
    FREQUENCY = MONTHLY
    START_TIMESTAMP = IMMEDIATELY
    TRIGGERS
        ON 80 PERCENT DO NOTIFY
        ON 95 PERCENT DO SUSPEND
        ON 100 PERCENT DO SUSPEND_IMMEDIATE;

ALTER WAREHOUSE ANALYTICS_WH SET RESOURCE_MONITOR = EDU_MONITOR;
```

## Constraints

### Required Rules (MUST)

1. **RBAC 필수**: 모든 사용자에게 커스텀 역할 부여, `ACCOUNTADMIN` 직접 사용 금지
2. **Network Policy 적용**: 프로덕션 환경에 IP 제한 필수
3. **MFA 활성화**: 관리자 계정(`ACCOUNTADMIN`, `SECURITYADMIN`) MFA 필수
4. **민감 데이터 마스킹**: PII 컬럼에 Masking Policy 적용
5. **감사 로그 모니터링**: `LOGIN_HISTORY`, `ACCESS_HISTORY` 정기 점검

### Prohibited Items (MUST NOT)

1. **ACCOUNTADMIN으로 일상 작업 금지**: 관리 작업에만 사용
2. **GRANT ALL PRIVILEGES 금지**: 필요한 권한만 개별 부여
3. **공유 계정 금지**: 사용자별 개별 계정 생성, 서비스 계정은 Key Pair 인증
4. **비밀번호 하드코딩 금지**: 연결 문자열에 비밀번호 포함하지 않음
5. **PUBLIC 역할에 권한 부여 금지**: 모든 사용자에게 노출됨

## Security Checklist

```markdown
- [ ] RBAC: 커스텀 역할 계층이 SYSADMIN에 연결됨
- [ ] RBAC: 최소 권한 원칙 적용 (GRANT 범위 확인)
- [ ] Network: Network Policy가 계정에 적용됨
- [ ] Network: 허용 IP 목록이 최소화됨
- [ ] Auth: ACCOUNTADMIN/SECURITYADMIN에 MFA 활성화
- [ ] Auth: 서비스 계정은 Key Pair 인증 사용
- [ ] Auth: 비밀번호 정책 적용 (최소 14자, 복잡성 요구)
- [ ] Auth: 세션 타임아웃 설정
- [ ] Data: PII 컬럼에 Masking Policy 적용
- [ ] Data: 필요 시 Row Access Policy 적용
- [ ] Data: Time Travel 보존 기간 적절히 설정
- [ ] Audit: LOGIN_HISTORY 실패 로그인 모니터링
- [ ] Audit: ACCESS_HISTORY 정기 점검
- [ ] Audit: Resource Monitor 설정 (비용 이상 탐지)
- [ ] Encryption: 기본 AES-256 암호화 확인 (Snowflake 기본 제공)
- [ ] Encryption: 필요 시 Tri-Secret Secure (고객 관리 키) 구성
```

## Best Practices

1. **Principle of Least Privilege**: 필요한 최소 권한만 부여
2. **Defense in Depth**: Network Policy + RBAC + Masking + Row Access 다층 방어
3. **Regular Audits**: 월 1회 이상 권한 검토 및 불필요 권한 회수
4. **Separation of Duties**: 관리 역할(`SECURITYADMIN`)과 운영 역할(`SYSADMIN`) 분리
5. **Automate Security**: Terraform/Snowflake CLI로 보안 설정 IaC 관리

## References

- [Snowflake Access Control](https://docs.snowflake.com/en/user-guide/security-access-control)
- [Network Policies](https://docs.snowflake.com/en/user-guide/network-policies)
- [Dynamic Data Masking](https://docs.snowflake.com/en/user-guide/security-column-ddm-use)
- [Row Access Policies](https://docs.snowflake.com/en/user-guide/security-row-intro)
- [Snowflake Security Overview](https://docs.snowflake.com/en/user-guide/admin-security)
- [Account Usage Views](https://docs.snowflake.com/en/sql-reference/account-usage)

## Metadata

### Version
- **Current Version**: 1.0.0
- **Last Updated**: 2026-04-07
- **Target Platform**: Snowflake

### Tags
`#security` `#Snowflake` `#RBAC` `#masking-policy` `#network-policy` `#row-access-policy` `#audit` `#MFA` `#encryption`
