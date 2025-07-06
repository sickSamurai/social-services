export type SendMessageToFriendRequest = {
  senderUserId: string,
  receiverUserId: string,
  messageContent: string,
  contentTypeId: string,
  fileType?: string
}