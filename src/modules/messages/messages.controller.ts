import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { MessagesService } from "../../services/messages/messages.service"
import { ChatHeader } from "../../models/dto/ChatHeader"
import { Message } from "../../models/dto/Message"
import { SendMessageToFriendRequest } from "../../models/requests/SendMessageToFriendRequest"
import { SendMessageToGroupRequest } from "../../models/requests/SendMessageToGroupRequest"
import { ResponseToGroupMessageRequest } from "../../models/requests/ResponseToGroupMessageRequest"
import { ResponseToFriendMessageRequest } from "../../models/requests/ResponseToFriendMessageRequest"

@Controller("api/messages")
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get("chat-headers")
  async getChatHeaders(@Query("userId") userId: string): Promise<ChatHeader[]> {
    return await this.messagesService.getChatHeaders(userId)
  }

  @Get("friends")
  async getMessagesByFriend(@Query("baseUser") baseUser: string, @Query("friend") friend: string): Promise<Message[]> {
    return await this.messagesService.getMessagesByFriendID(baseUser, friend)
  }

  @Get("groups")
  async getMessagesByGroup(@Query("baseUser") baseUser: string, @Query("groupId") groupId: number): Promise<Message[]> {
    return await this.messagesService.getMessagesByGroupID(baseUser, groupId)
  }

  @Post("friends")
  async sendMessageToFriend(@Body() request: SendMessageToFriendRequest): Promise<void> {
    await this.messagesService.sendMessageToFriend(request)
  }

  @Post("responses/friends")
  async responseToFriendMessage(@Body() request: ResponseToFriendMessageRequest): Promise<void> {
    await this.messagesService.responseToFriendMessage(request)
  }

  @Post("groups")
  async sendMessageToGroup(@Body() request: SendMessageToGroupRequest): Promise<void> {
    await this.messagesService.sendMessageToGroup(request)
  }

  @Post("responses/groups")
  async responseToGroupMessage(@Body() request: ResponseToGroupMessageRequest): Promise<void> {
    await this.messagesService.responseToGroupMessage(request)
  }
}
