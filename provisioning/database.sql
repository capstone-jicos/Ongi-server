USE ongi;
CREATE TABLE users (
    uniqueId VARCHAR(64) NOT NULL,          -- 사용자 고유식별 ID (해쉬값으로)
    displayName VARCHAR(64) NOT NULL,       -- 사용자 이름 (닉네임 같은 것)
    profileImage VARCHAR(64) DEFAULT NULL,  -- 프로필 이미지 링크
    gender CHAR NOT NULL,                   -- 성별
    country INT(3) DEFAULT NULL,            -- 나이
    state VARCHAR(3) DEFAULT NULL,          -- 국가
    city VARCHAR(3) DEFAULT NULL,           -- 주 / 도
    PRIMARY KEY (uniqueId)                  -- 도시
);

CREATE TABLE userPayments (
    userId VARCHAR(64) NOT NULL,            -- 사용자 고유 ID (FK ajrdudigka)
    billingId VARCHAR(64) NOT NULL,         -- 아임포트에서 저장된 빌링키
    cardType VARCHAR(3) NOT NULL,           -- 카드 종류 (삼성, 현대 등 코드로 입력)
    cardNum INT(2) NOT NULL,                -- 카더 번호 뒷 2자리
    PRIMARY KEY (billingId),
    FOREIGN KEY (userid) REFERENCES users (uniqueId)
);

CREATE TABLE loginCredential (
    provider VARCHAR(3) NOT NULL,                         -- 로그인 방법
    uniqueId VARCHAR(64) NOT NULL,                          -- 사용자 고유식별 ID
    userId VARCHAR(64) NOT NULL,                            -- 해당 로그인 방법의 ID
    accessToken VARCHAR(32) NOT NULL,                       -- 해당 로그인 방법의 추가 로그인 키
    FOREIGN KEY (uniqueId) REFERENCES users (uniqueId),     
    PRIMARY KEY (provider, uniqueId)
);

CREATE TABLE venue (
    idx VARCHAR(64) NOT NULL,
    country VARCHAR(3) NOT NULL,
    state VARCHAR(10) NOT NULL,
    city VARCHAR(20) NOT NULL,
    streetAddress TEXT NOT NULL,
    detailAddress TEXT NOT NULL,
    PRIMARY KEY (idx)
);

CREATE TABLE events (
    idx VARCHAR(64) NOT NULL,
    title VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    hostId VARCHAR(64) NOT NULL,
    venueId VARCHAR(64) NOT NULL,
    feeAmount INT(10) NOT NULL,
    PRIMARY KEY (idx),
    FOREIGN KEY (hostId) REFERENCES users (uniqueId),
    FOREIGN KEY (venueId) REFERENCES venue (idx)
);

CREATE TABLE comments (
    idx VARCHAR(64) NOT NULL,
    eventId VARCHAR(64) NOT NULL,
    parentId VARCHAR(64) NULL,
    writerId VARCHAR(64) NOT NULL,
    comment TEXT NOT NULL,
    createdAt DATETIME DEFAULT NOW(),
    updatedAt DATETIME DEFAULT NOW(),
    PRIMARY KEY (idx),
    FOREIGN KEY (parentId) REFERENCES comments (idx),
    FOREIGN KEY (eventId) REFERENCES events (idx),
    FOREIGN KEY (writerId) REFERENCES users (uniqueId)
);

CREATE TABLE attendees (
    eventId VARCHAR(64) NOT NULL,
    attendeeId VARCHAR(64) NOT NULL,
    attending INT(1) NOT NULL,
    FOREIGN KEY (eventId) REFERENCES events (idx),
    FOREIGN KEY (attendeeId) REFERENCES users (uniqueId),
    PRIMARY KEY (eventId, attendeeId)
);

CREATE TABLE paymentLog (
    transactionId VARCHAR(64) NOT NULL,
    userId VARCHAR(64) NOT NULL,
    PRIMARY KEY (transactionId),
    FOREIGN KEY (userId) REFERENCES users (uniqueId)
);