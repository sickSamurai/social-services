export type ResponseToGroupMessageRequest = {
  parentMessageId?: string;
  senderUserId: string;
  groupId: number;
  messageContent: string;
  contentTypeId?: string;
  fileType?: string;
}