create table SOCIAL_UD.LOCATION_TYPE
(
    LOCATION_TYPE_CODE        VARCHAR2(3)  not null primary key,
    LOCATION_TYPE_DESCRIPTION VARCHAR2(20) not null
);

create table SOCIAL_UD.LOCATION
(
    LOCATION_CODE      VARCHAR2(4)  not null primary key,
    LOCATION_TYPE_CODE VARCHAR2(3)  not null
        constraint FK_LOCATION_TYPE references SOCIAL_UD.LOCATION_TYPE,
    LOCATION_NAME      VARCHAR2(30) not null,
    PARENT_LOCATION    VARCHAR2(4)
        constraint FK_LOCATION_ROOT references SOCIAL_UD.LOCATION
);

CREATE TABLE SOCIAL_UD.PENDING_USER
(
    TOKEN            VARCHAR2(36) PRIMARY KEY,
    USER_ID          VARCHAR2(5),
    USER_NAME        VARCHAR2(25),
    USER_LAST_NAME   VARCHAR2(25),
    USER_UNIQUE_NAME VARCHAR2(6),
    EMAIL            VARCHAR2(50),
    PHONE            VARCHAR2(16),
    LOCATION_CODE    VARCHAR2(4),
    CREATED_AT       DATE DEFAULT SYSDATE
);

create table SOCIAL_UD.SOCIAL_USER
(
    USER_ID           VARCHAR2(5)  not null primary key,
    USER_NAME         VARCHAR2(25) not null,
    USER_LAST_NAME    VARCHAR2(25) not null,
    USER_UNIQUE_NAME  VARCHAR2(6)  not null,
    USER_MODIFIER     VARCHAR2(5)  null
        constraint FK_SOCIAL_USER_MODIFIER references SOCIAL_UD.SOCIAL_USER (USER_ID),
    REGISTRATION_DATE DATE         not null,
    EMAIL             VARCHAR2(50) not null,
    PHONE             VARCHAR2(16) not null,
    IMAGE             BLOB         null,
    THEME             BLOB         null,
    FINGERPRINT       BLOB         null,
    LOCATION_CODE     VARCHAR2(4)  not null
        constraint FK_SOCIAL_USER_LOCATION references SOCIAL_UD.LOCATION
);

CREATE TABLE SOCIAL_UD.USER_FRIENDSHIP
(
    USER_A VARCHAR2(5) not null,
    USER_B VARCHAR2(5) not null,
    PRIMARY KEY (USER_A, USER_B),
    CONSTRAINT FK_USER_FRIENDSHIP_A FOREIGN KEY (USER_A) REFERENCES SOCIAL_UD.SOCIAL_USER (USER_ID),
    CONSTRAINT FK_USER_FRIENDSHIP_B FOREIGN KEY (USER_B) REFERENCES SOCIAL_UD.SOCIAL_USER (USER_ID)
);

CREATE TABLE SOCIAL_UD.USER_FOLLOWING
(
    FOLLOWER_USER_ID VARCHAR2(5) not null,
    FOLLOWED_USER_ID VARCHAR2(5) not null,
    PRIMARY KEY (FOLLOWER_USER_ID, FOLLOWED_USER_ID),
    CONSTRAINT FK_USER_FOLLOWING_FOLLOWER FOREIGN KEY (FOLLOWER_USER_ID) REFERENCES SOCIAL_UD.SOCIAL_USER (USER_ID),
    CONSTRAINT FK_USER_FOLLOWING_FOLLOWING FOREIGN KEY (FOLLOWED_USER_ID) REFERENCES SOCIAL_UD.SOCIAL_USER (USER_ID)
);

CREATE TABLE PROPERTY
(
    PROPERTY_ID          VARCHAR2(8)   not null primary key,
    PARENT_PROPERTY_ID   VARCHAR2(8)   null
        constraint FK_PROPERTY_PARENT references PROPERTY (PROPERTY_ID),
    PROPERTY_DESCRIPTION VARCHAR2(100) null,
    PROPERTY_VALUE       VARCHAR2(30)  null,
    DEFAULT_VALUE        CHAR(1)       null
        CONSTRAINT CHK_PROPERTY_DEFAULT_VALUE CHECK (DEFAULT_VALUE IN ('1', '0'))
);

CREATE TABLE SOCIAL_UD.SOCIAL_GROUP
(
    GROUP_ID          NUMBER(5, 0) not null primary key,
    GROUP_MODIFIER    NUMBER(5, 0) null
        CONSTRAINT FK_GROUP_MODIFIER REFERENCES SOCIAL_UD.SOCIAL_GROUP (GROUP_ID),
    CREATOR_USER_ID   VARCHAR2(5)  not null
        constraint FK_GROUP_CREATOR references SOCIAL_UD.SOCIAL_USER (USER_ID),
    GROUP_NAME        VARCHAR2(30) not null,
    REGISTRATION_DATE DATE         not null,
    GROUP_IMAGE       BLOB         not null
);

CREATE TABLE SOCIAL_UD.GROUP_MEMBERSHIP
(
    GROUP_ID NUMBER(5, 0) not null,
    USER_ID  VARCHAR2(5)  not null,
    PRIMARY KEY (GROUP_ID, USER_ID),
    CONSTRAINT FK_GROUP_MEMBER_GROUP FOREIGN KEY (GROUP_ID) REFERENCES SOCIAL_UD.SOCIAL_GROUP (GROUP_ID),
    CONSTRAINT FK_GROUP_MEMBER_USER FOREIGN KEY (USER_ID) REFERENCES SOCIAL_UD.SOCIAL_USER (USER_ID)
);

CREATE TABLE SOCIAL_UD.USER_CONFIGURATION
(
    USER_ID              VARCHAR2(5)  not null,
    CONFIGURATION_NUMBER NUMBER(3, 0) not null,
    PROPERTY_ID          VARCHAR2(8)  not null
        constraint FK_USER_CONFIGURATION_PROPERTY references PROPERTY (PROPERTY_ID),
    STATUS               CHAR(1)      null
        CONSTRAINT CHK_USER_CONFIGURATION_STATUS CHECK (STATUS IN ('1', '0')),
    VALUE                NUMBER(1, 0) not null,
    PRIMARY KEY (USER_ID, CONFIGURATION_NUMBER),
    CONSTRAINT FK_USER_CONFIGURATION_USER FOREIGN KEY (USER_ID) REFERENCES SOCIAL_UD.SOCIAL_USER (USER_ID)
);

CREATE TABLE SOCIAL_UD.GROUP_CONFIGURATION
(
    GROUP_ID             NUMBER(5, 0) not null,
    CONFIGURATION_NUMBER NUMBER(3, 0) not null,
    PROPERTY_ID          VARCHAR2(8)  not null
        constraint FK_GROUP_CONFIGURATION_PROPERTY references PROPERTY (PROPERTY_ID),
    STATUS               CHAR(1)      not null
        CONSTRAINT CHK_GROUP_CONFIGURATION_STATUS CHECK (STATUS IN ('1', '0')),
    VALUE                NUMBER(1, 0) not null,
    PRIMARY KEY (GROUP_ID, CONFIGURATION_NUMBER),
    CONSTRAINT FK_GROUP_CONFIGURATION_GROUP FOREIGN KEY (GROUP_ID) REFERENCES SOCIAL_UD.SOCIAL_GROUP (GROUP_ID)
);

CREATE TABLE SOCIAL_UD.MESSAGE
(
    MESSAGE_ID        NUMBER(5, 0) not null primary key,
    PARENT_MESSAGE_ID NUMBER(5, 0) null
        constraint FK_MESSAGE_PARENT references SOCIAL_UD.MESSAGE (MESSAGE_ID),
    GROUP_ID          NUMBER(5, 0) null
        constraint FK_MESSAGE_GROUP references SOCIAL_UD.SOCIAL_GROUP (GROUP_ID),
    SENDER_USER_ID    VARCHAR2(5)  not null
        constraint FK_MESSAGE_SENDER references SOCIAL_UD.SOCIAL_USER (USER_ID),
    RECEIVER_USER_ID  VARCHAR2(5)  not null
        constraint FK_MESSAGE_RECEIVER references SOCIAL_UD.SOCIAL_USER (USER_ID),
    MESSAGE_DATE      DATE         not null
);

CREATE TABLE SOCIAL_UD.CONTENT_TYPE
(
    CONTENT_TYPE_ID  VARCHAR2(2)  not null primary key,
    TYPE_DESCRIPTION VARCHAR2(30) not null
);

CREATE TABLE SOCIAL_UD.FILE_TYPE
(
    FILE_TYPE_ID          VARCHAR2(3)  not null primary key,
    FILE_TYPE_DESCRIPTION VARCHAR2(30) not null
);

CREATE TABLE SOCIAL_UD.CONTENT
(
    MESSAGE_ID          NUMBER(5, 0)  not null,
    CONTENT_ID          NUMBER(2, 0)  not null,
    CONTENT_IMAGE       BLOB          not null,
    CONTENT_DESCRIPTION VARCHAR2(255) null,
    CONTENT_TYPE_ID     VARCHAR2(2)   not null,
    FILE_TYPE           VARCHAR2(3)   null,
    PRIMARY KEY (MESSAGE_ID, CONTENT_ID),
    CONSTRAINT FK_CONTENT_MESSAGE_ID FOREIGN KEY (MESSAGE_ID) REFERENCES SOCIAL_UD.MESSAGE (MESSAGE_ID),
    CONSTRAINT FK_CONTENT_TYPE FOREIGN KEY (CONTENT_TYPE_ID) REFERENCES SOCIAL_UD.CONTENT_TYPE (CONTENT_TYPE_ID),
    CONSTRAINT FK_CONTENT_FILE_TYPE FOREIGN KEY (FILE_TYPE) REFERENCES SOCIAL_UD.FILE_TYPE (FILE_TYPE_ID)
);