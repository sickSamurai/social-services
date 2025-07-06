import { Injectable } from "@nestjs/common"
import { DataSource } from "typeorm"
import { Message } from "../../models/Message"
import { ChatHeader } from "../../models/ChatHeader"
import { SendMessageToGroupRequest } from "../../models/SendMessageToGroupRequest"
import { SendMessageToFriendRequest } from "../../models/SendMessageToFriendRequest"
import { ResponseToFriendMessageRequest } from "../../models/ResponseToFriendMessageRequest"
import { ResponseToGroupMessageRequest } from "../../models/ResponseToGroupMessageRequest"

@Injectable()
export class MessagesService {
  constructor(private dataSource: DataSource) {}

  async getChatHeaders(baseUser: string): Promise<ChatHeader[]> {
    const sql = `
        SELECT DISTINCT 'FRIENDSHIP'                                                                           AS CHAT_TYPE,
                        FRIEND.USER_ID                                                                         AS CHAT_PARTIAL_ID,
                        FRIEND.USER_NAME || ' ' || FRIEND.USER_LAST_NAME                                       AS CHAT_NAME,
                        (SELECT MAX(M.MESSAGE_DATE)
                         FROM SOCIAL_UD.MESSAGE M
                         WHERE (M.SENDER_USER_ID = BASE_USER.USER_ID AND M.RECEIVER_USER_ID = FRIEND.USER_ID)
                            OR (M.SENDER_USER_ID = FRIEND.USER_ID AND M.RECEIVER_USER_ID = BASE_USER.USER_ID)) AS LAST_MESSAGE_DATE
        FROM SOCIAL_UD.SOCIAL_USER BASE_USER
                 JOIN SOCIAL_UD.USER_FRIENDSHIP UF ON BASE_USER.USER_ID = UF.USER_A
                 JOIN SOCIAL_UD.SOCIAL_USER FRIEND ON UF.USER_B = FRIEND.USER_ID
        WHERE BASE_USER.USER_ID = ${baseUser}
        UNION ALL
        SELECT 'GROUP'                           AS CHAT_TYPE,
               CAST(SG.GROUP_ID AS VARCHAR(5))   AS CHAT_PARTIAL_ID,
               SG.GROUP_NAME                     AS CHAT_NAME,
               (SELECT MAX(M.MESSAGE_DATE)
                FROM SOCIAL_UD.MESSAGE M
                WHERE M.GROUP_ID = SGM.GROUP_ID) AS LAST_MESSAGE_DATE
        FROM SOCIAL_UD.GROUP_MEMBERSHIP SGM
                 JOIN SOCIAL_UD.SOCIAL_GROUP SG ON SGM.GROUP_ID = SG.GROUP_ID
        WHERE SGM.USER_ID = ${baseUser}
    `

    return await this.dataSource.query<ChatHeader[]>(sql)
  }

  async getMessagesByFriendID(baseUser: string, friend: string): Promise<Message[]> {
    const sql = `
        SELECT M.MESSAGE_ID,
               M.MESSAGE_DATE,
               M.SENDER_USER_ID,
               SU_SENDER.USER_NAME || ' ' || SU_SENDER.USER_LAST_NAME     AS SENDER_NAME,
               M.RECEIVER_USER_ID,
               SU_RECEIVER.USER_NAME || ' ' || SU_RECEIVER.USER_LAST_NAME AS RECEIVER_NAME,
               C.CONTENT_DESCRIPTION                                      AS MESSAGE_CONTENT,
               CT.TYPE_DESCRIPTION                                        AS CONTENT_TYPE_DESCRIPTION,
               FT.FILE_TYPE_DESCRIPTION                                   AS FILE_TYPE_DESCRIPTION
        FROM SOCIAL_UD.MESSAGE M
                 JOIN SOCIAL_UD.SOCIAL_USER SU_SENDER ON M.SENDER_USER_ID = SU_SENDER.USER_ID
                 JOIN SOCIAL_UD.SOCIAL_USER SU_RECEIVER ON M.RECEIVER_USER_ID = SU_RECEIVER.USER_ID
                 JOIN SOCIAL_UD.CONTENT C ON M.MESSAGE_ID = C.MESSAGE_ID
                 LEFT JOIN SOCIAL_UD.CONTENT_TYPE CT ON C.CONTENT_TYPE_ID = CT.CONTENT_TYPE_ID
                 LEFT JOIN SOCIAL_UD.FILE_TYPE FT ON C.FILE_TYPE = FT.FILE_TYPE_ID
        WHERE M.GROUP_ID IS null AND
              (M.SENDER_USER_ID = ${baseUser} AND M.RECEIVER_USER_ID = ${friend})
           OR (M.SENDER_USER_ID = ${friend} AND M.RECEIVER_USER_ID = ${baseUser})
        ORDER BY M.MESSAGE_DATE DESC
            FETCH FIRST 10 ROWS ONLY
    `
    return await this.dataSource.query<Message[]>(sql)
  }

  /**
   *
   * @param baseUser El ID del usuario base que está solicitando los mensajes.
   * @param groupId El ID del grupo del cual se desean obtener los mensajes.
   *
   * @returns Un array de mensajes del grupo, incluyendo detalles del remitente y destinatario.
   */
  async getMessagesByGroupID(baseUser: string, groupId: number): Promise<Message[]> {
    const sql = `
        SELECT M.MESSAGE_ID,
               M.MESSAGE_DATE,
               SU_RECEIVER.USER_ID                                        as RECEIVER_USER_ID,
               SU_RECEIVER.USER_NAME || ' ' || SU_RECEIVER.USER_LAST_NAME AS RECEIVER_NAME,
               SU_SENDER.USER_ID                                          as SENDER_USER_ID,
               SU_SENDER.USER_NAME || ' ' || SU_SENDER.USER_LAST_NAME     AS SENDER_NAME,
               C.CONTENT_DESCRIPTION                                      AS MESSAGE_CONTENT,
               CT.TYPE_DESCRIPTION                                        AS CONTENT_TYPE_DESCRIPTION,
               FT.FILE_TYPE_DESCRIPTION                                   AS FILE_TYPE_DESCRIPTION
        FROM SOCIAL_UD.MESSAGE M
                 JOIN SOCIAL_UD.SOCIAL_USER SU_SENDER ON M.SENDER_USER_ID = SU_SENDER.USER_ID
                 JOIN SOCIAL_UD.SOCIAL_USER SU_RECEIVER ON M.RECEIVER_USER_ID = SU_RECEIVER.USER_ID
                 JOIN SOCIAL_UD.CONTENT C ON M.MESSAGE_ID = C.MESSAGE_ID
                 LEFT JOIN SOCIAL_UD.CONTENT_TYPE CT ON C.CONTENT_TYPE_ID = CT.CONTENT_TYPE_ID
                 LEFT JOIN SOCIAL_UD.FILE_TYPE FT ON C.FILE_TYPE = FT.FILE_TYPE_ID
        WHERE M.GROUP_ID = ${groupId}
          AND (M.RECEIVER_USER_ID = ${baseUser} OR M.SENDER_USER_ID = ${baseUser})
        ORDER BY M.MESSAGE_DATE DESC
            FETCH FIRST 10 ROWS ONLY
    `
    return await this.dataSource.query<Message[]>(sql)
  }

  /**
   * Envía un mensaje a un chat privado entre dos usuarios.
   *
   * @param request El objeto que contiene los detalles del mensaje a enviar.
   */
  async sendMessageToFriend(request: SendMessageToFriendRequest): Promise<void> {
    const createMessageQuery = `INSERT INTO SOCIAL_UD.MESSAGE (MESSAGE_ID, PARENT_MESSAGE_ID, SENDER_USER_ID, RECEIVER_USER_ID, MESSAGE_DATE)
                                VALUES (SOCIAL_UD.MESSAGE_ID_SEQ.NEXTVAL, NULL, :senderUserId, :receiverUserId, SYSDATE)`
    const createMessageQueryParams = [request.senderUserId, request.receiverUserId]
    await this.dataSource.query(createMessageQuery, createMessageQueryParams)
    const contentQuery = `INSERT INTO SOCIAL_UD.CONTENT (MESSAGE_ID, CONTENT_ID, CONTENT_IMAGE, CONTENT_DESCRIPTION, CONTENT_TYPE_ID, FILE_TYPE)
                          VALUES (SOCIAL_UD.MESSAGE_ID_SEQ.CURRVAL, 1, EMPTY_BLOB(), :messageContent, :contentTypeId, :fileType)`
    const contentQueryParams = [request.messageContent, request.contentTypeId, request.fileType]
    await this.dataSource.query(contentQuery, contentQueryParams)
  }

  /**
   * Envía un mensaje a un grupo, lo que implica enviarlo a cada uno de los miembros del grupo, en calidad de destinatarios del mensaje.
   *
   * @param dto El objeto DTO que contiene los detalles del mensaje a enviar.
   */
  async sendMessageToGroup(dto: SendMessageToGroupRequest): Promise<void> {
    const groupMembersSql = "SELECT USER_ID FROM SOCIAL_UD.GROUP_MEMBERSHIP WHERE GROUP_ID = :groupId AND USER_ID != :senderUserId"
    const groupMembers = await this.dataSource.query<{ USER_ID: string }[]>(groupMembersSql, [dto.groupId, dto.senderUserId])
    for (const member of groupMembers) {
      const sql = `INSERT INTO SOCIAL_UD.MESSAGE (MESSAGE_ID, PARENT_MESSAGE_ID, GROUP_ID, SENDER_USER_ID, RECEIVER_USER_ID, MESSAGE_DATE)
                   VALUES (SOCIAL_UD.MESSAGE_ID_SEQ.NEXTVAL, NULL, :groupId, :senderUserId, :receiverUserId, SYSDATE)`
      const params = [dto.groupId, dto.senderUserId, member.USER_ID]
      await this.dataSource.query(sql, params)
      const contentSql = `INSERT INTO SOCIAL_UD.CONTENT (MESSAGE_ID, CONTENT_ID, CONTENT_IMAGE, CONTENT_DESCRIPTION, CONTENT_TYPE_ID, FILE_TYPE)
                          VALUES (SOCIAL_UD.MESSAGE_ID_SEQ.CURRVAL, 1, EMPTY_BLOB(), :messageContent, :contentTypeId, :fileTypeId)`
      const contentParams = [dto.messageContent, dto.contentTypeId, dto.fileTypeId]
      await this.dataSource.query(contentSql, contentParams)
    }
  }

  async responseToFriendMessage(request: ResponseToFriendMessageRequest): Promise<void> {
    const createMessageQuery = `INSERT INTO SOCIAL_UD.MESSAGE (MESSAGE_ID, PARENT_MESSAGE_ID, SENDER_USER_ID, RECEIVER_USER_ID, MESSAGE_DATE)
                                VALUES (SOCIAL_UD.MESSAGE_ID_SEQ.NEXTVAL, :parentMessageId, :senderUserId, :receiverUserId, SYSDATE)`
    const createMessageQueryParams = [request.parentMessageId, request.senderUserId, request.receiverUserId]
    await this.dataSource.query(createMessageQuery, createMessageQueryParams)
    const contentQuery = `INSERT INTO SOCIAL_UD.CONTENT (MESSAGE_ID, CONTENT_ID, CONTENT_IMAGE, CONTENT_DESCRIPTION, CONTENT_TYPE_ID, FILE_TYPE)
                          VALUES (SOCIAL_UD.MESSAGE_ID_SEQ.CURRVAL, 1, EMPTY_BLOB(), :messageContent, :contentTypeId, :fileType)`
    const contentQueryParams = [request.messageContent, request.contentTypeId, request.fileType]
    await this.dataSource.query(contentQuery, contentQueryParams)
  }

  async responseToGroupMessage(request: ResponseToGroupMessageRequest): Promise<void> {
    const groupMembersSql = "SELECT USER_ID FROM SOCIAL_UD.GROUP_MEMBERSHIP WHERE GROUP_ID = :groupId AND USER_ID != :senderUserId"
    const groupMembers = await this.dataSource.query<{ USER_ID: string }[]>(groupMembersSql, [request.groupId, request.senderUserId])
    for (const member of groupMembers) {
      const sql = `INSERT INTO SOCIAL_UD.MESSAGE (MESSAGE_ID, PARENT_MESSAGE_ID, GROUP_ID, SENDER_USER_ID, RECEIVER_USER_ID, MESSAGE_DATE)
                   VALUES (SOCIAL_UD.MESSAGE_ID_SEQ.NEXTVAL, :parentMessageId, :groupId, :senderUserId, :receiverUserId, SYSDATE)`
      const params = [request.parentMessageId, request.groupId, request.senderUserId, member.USER_ID]
      await this.dataSource.query(sql, params)
      const contentSql = `INSERT INTO SOCIAL_UD.CONTENT (MESSAGE_ID, CONTENT_ID, CONTENT_IMAGE, CONTENT_DESCRIPTION, CONTENT_TYPE_ID, FILE_TYPE)
                          VALUES (SOCIAL_UD.MESSAGE_ID_SEQ.CURRVAL, 1, EMPTY_BLOB(), :messageContent, :contentTypeId, :fileType)`
      const contentParams = [request.messageContent, request.contentTypeId, request.fileType]
      await this.dataSource.query(contentSql, contentParams)
    }
  }
}
