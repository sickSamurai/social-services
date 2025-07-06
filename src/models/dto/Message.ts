export type Message = {
  MESSAGE_ID: string;
  MESSAGE_DATE: string;
  SENDER_USER_ID: string;
  SENDER_NAME: string;
  RECEIVER_USER_ID: string;
  RECEIVER_NAME: string;
  MESSAGE_CONTENT: string;
  CONTENT_TYPE_DESCRIPTION: string;
  FILE_TYPE_DESCRIPTION: string | undefined;
}