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
    constraint FK_LOCATION_ROOT
      references SOCIAL_UD.LOCATION
);

create table SOCIAL_UD.SOCIAL_USER
(
  USER_ID           VARCHAR2(5)  not null
    primary key,
  USER_NAME         VARCHAR2(25) not null,
  USER_LAST_NAME    VARCHAR2(25) not null,
  USER_UNIQUE_NAME  VARCHAR2(6)  not null,
  REGISTRATION_DATE DATE         not null,
  EMAIL             VARCHAR2(50) not null,
  PHONE             VARCHAR2(16) not null,
  LOCATION_CODE     VARCHAR2(4)  not null
    constraint FK_SOCIAL_USER_LOCATION
      references SOCIAL_UD.LOCATION
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
