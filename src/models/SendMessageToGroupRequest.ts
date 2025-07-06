export type SendMessageToGroupRequest = {
  groupId: string;
  senderUserId: string;
  contentDescription: string;
  contentTypeId?: number; // Optional, if not provided, defaults to text
  fileTypeId?: number; // Optional, if not provided, defaults to null
}