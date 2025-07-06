export type ResponseToFriendMessageRequest = {
  parentMessageId?: string;
  senderUserId: string;
  receiverUserId: string;
  messageContent: string;
  contentTypeId?: string;
  fileType?: string
}