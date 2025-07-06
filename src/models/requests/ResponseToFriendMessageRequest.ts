export type ResponseToFriendMessageRequest = {
  parentMessageId?: number;
  senderUserId: string;
  receiverUserId: string;
  messageContent: string;
  contentTypeId?: string;
  fileType?: string
}