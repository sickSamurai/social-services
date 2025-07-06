import { Injectable } from "@nestjs/common"
import { DataSource } from "typeorm"
import { Message } from "../../models/Message"
import { ChatHeader } from "../../models/ChatHeader"

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
        WHERE BASE_USER.USER_ID = '${baseUser}'
        UNION ALL
        SELECT 'GROUP'                           AS CHAT_TYPE,
               CAST(SG.GROUP_ID AS VARCHAR(5))   AS CHAT_PARTIAL_ID,
               SG.GROUP_NAME                     AS CHAT_NAME,
               (SELECT MAX(M.MESSAGE_DATE)
                FROM SOCIAL_UD.MESSAGE M
                WHERE M.GROUP_ID = SGM.GROUP_ID) AS LAST_MESSAGE_DATE
        FROM SOCIAL_UD.GROUP_MEMBERSHIP SGM
                 JOIN SOCIAL_UD.SOCIAL_GROUP SG ON SGM.GROUP_ID = SG.GROUP_ID
        WHERE SGM.USER_ID = '${baseUser}';
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
              (M.SENDER_USER_ID = '${baseUser}' AND M.RECEIVER_USER_ID = '${friend}')
           OR (M.SENDER_USER_ID = '${friend}' AND M.RECEIVER_USER_ID = '${baseUser}')
        ORDER BY M.MESSAGE_DATE DESC
            FETCH FIRST 10 ROWS ONLY;
    `
    return await this.dataSource.query<Message[]>(sql)
  }

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
          AND (M.RECEIVER_USER_ID = '${baseUser}' OR M.SENDER_USER_ID = '${baseUser}')
        ORDER BY M.MESSAGE_DATE DESC
            FETCH FIRST 10 ROWS ONLY;
    `
    return await this.dataSource.query<Message[]>(sql)
  }
}
