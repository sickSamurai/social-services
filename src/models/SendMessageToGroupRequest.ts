export type SendMessageToGroupRequest = {
  senderUserId: string;
  groupId: number;
  messageContent: string;
  contentTypeId?: number; // Optional, if not provided, defaults to text
  fileTypeId?: number; // Optional, if not provided, defaults to null
}