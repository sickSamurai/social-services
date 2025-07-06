import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { MessagesService } from "../../services/messages/messages.service"
import { ChatHeader } from "../../models/ChatHeader"
import { Message } from "../../models/Message"
import { SendMessageToFriendRequest } from "../../models/SendMessageToFriendRequest"
import { SendMessageToGroupRequest } from "../../models/SendMessageToGroupRequest"

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

  @Post("groups")
  async sendMessageToGroup(@Body() request: SendMessageToGroupRequest): Promise<void> {
    await this.messagesService.sendMessageToGroup(request)
  }
}
