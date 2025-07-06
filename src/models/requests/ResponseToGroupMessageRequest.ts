export type ResponseToGroupMessageRequest = {
  parentMessageId?: number;
  senderUserId: string;
  groupId: number;
  messageContent: string;
  contentTypeId?: string;
  fileType?: string;
}