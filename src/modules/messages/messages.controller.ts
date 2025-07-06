import { Controller, Get, Query } from "@nestjs/common"
import { MessagesService } from "../../services/messages/messages.service"
import { ChatHeader } from "../../models/ChatHeader"
import { Message } from "../../models/Message"

@Controller("messages")
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get("chat-headers")
  async getChatHeaders(@Query("userId") userId: string): Promise<ChatHeader[]> {
    return await this.messagesService.getChatHeaders(userId)
  }

  @Get("messages-by-friend")
  async getMessagesByFriend(@Query("baseUser") baseUser: string, @Query("friend") friend: string): Promise<Message[]> {
    return await this.messagesService.getMessagesByFriendID(baseUser, friend)
  }

  @Get("messages-by-group")
  async getMessagesByGroup(@Query("baseUser") baseUser: string, @Query("groupId") groupId: number): Promise<Message[]> {
    return await this.messagesService.getMessagesByGroupID(baseUser, groupId)
  }
}
