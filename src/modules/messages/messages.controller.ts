import { Body, Controller, Get, Post, Query, UploadedFile, UseInterceptors } from "@nestjs/common"
import { MessagesService } from "../../services/messages/messages.service"
import { ChatHeader } from "../../models/dataModels/ChatHeader"
import { FriendMessageData } from "../../models/requests/FriendMessageData"
import { GroupMessageData } from "../../models/requests/GroupMessageData"
import { GroupResponseData } from "../../models/requests/GroupResponseData"
import { FriendResponseData } from "../../models/requests/FriendResponseData"
import { FileInterceptor } from "@nestjs/platform-express"
import { EncodedMessage } from "../../models/responses/EncodedMessage"

@Controller("api/messages")
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get("chat-headers")
  async getChatHeaders(@Query("userId") userId: string): Promise<ChatHeader[]> {
    return await this.messagesService.getChatHeaders(userId)
  }

  @Get("friends")
  async getMessagesByFriend(@Query("baseUser") baseUser: string, @Query("friend") friend: string): Promise<EncodedMessage[]> {
    return await this.messagesService.getMessagesByFriendID(baseUser, friend)
  }

  @Get("groups")
  async getMessagesByGroup(@Query("baseUser") baseUser: string, @Query("groupId") groupId: number): Promise<EncodedMessage[]> {
    return await this.messagesService.getMessagesByGroupID(baseUser, groupId)
  }

  @Post("friends")
  @UseInterceptors(FileInterceptor("file"))
  async sendMessageToFriend(@Body() request: FriendMessageData, @UploadedFile("file") file?: Express.Multer.File): Promise<void> {
    await this.messagesService.sendMessageToFriend(request, file)
  }

  @Post("responses/friends")
  @UseInterceptors(FileInterceptor("file"))
  async responseToFriendMessage(@Body() request: FriendResponseData, @UploadedFile("file") fileContent: Express.Multer.File): Promise<void> {
    await this.messagesService.responseToFriendMessage(request, fileContent)
  }

  @Post("groups")
  @UseInterceptors(FileInterceptor("file"))
  async sendMessageToGroup(@Body() request: GroupMessageData, @UploadedFile("file") fileContent: Express.Multer.File): Promise<void> {
    await this.messagesService.sendMessageToGroup(request, fileContent)
  }

  @Post("responses/groups")
  @UseInterceptors(FileInterceptor("file"))
  async responseToGroupMessage(@Body() request: GroupResponseData, @UploadedFile("file") fileContent: Express.Multer.File): Promise<void> {
    await this.messagesService.responseToGroupMessage(request, fileContent)
  }
}
