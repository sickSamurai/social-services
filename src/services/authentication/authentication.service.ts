import { Injectable } from "@nestjs/common"
import { DataSource } from "typeorm"
import { EmailValidation } from "../../models/responses/EmailValidation"
import { CreateUserRequest } from "../../models/requests/CreateUserRequest"
import { v4 as uuidv4 } from "uuid"
import { CountResult } from "../../models/dataModels/CountResult"
import { PendingUser } from "../../models/dataModels/PendingUser"
import { RegisterResponse } from "../../models/responses/RegisterResponse"
import { SocialUser } from "../../models/dataModels/SocialUser"


@Injectable()
export class AuthenticationService {
  constructor(private dataSource: DataSource) {}

  async validateEmail(email: string): Promise<EmailValidation> {
    const sql: string = "SELECT COUNT(*) AS count FROM SOCIAL_USER WHERE UPPER(EMAIL) = UPPER(:p)"
    const result = await this.dataSource.query<CountResult[]>(sql, [email])
    return <EmailValidation>{ EMAIL_EXISTS: result[0].COUNT > 0 }
  }

  async generateUserID(): Promise<string> {
    const sql: string = "SELECT COUNT(*) AS count FROM SOCIAL_UD.SOCIAL_USER"
    const result = await this.dataSource.query<CountResult[]>(sql)
    const nextNumber = result[0].COUNT + 1
    const padded = nextNumber.toString().padStart(4, "0")
    return `U${padded}`
  }


  async registerPendingUser(request: CreateUserRequest): Promise<RegisterResponse> {
    const token = uuidv4()

    const sql = `
        INSERT INTO SOCIAL_UD.PENDING_USER (TOKEN, USER_ID, USER_NAME, USER_LAST_NAME, USER_UNIQUE_NAME, EMAIL, PHONE, LOCATION_CODE)
        VALUES (:token, :userId, :userName, :userLastName, :userUniqueName, :email, :phone, :locationCode)
    `

    const params = [token, await this.generateUserID(), request.username, request.name, request.username, request.email, request.phone, request.locationCode]
    await this.dataSource.query(sql, params)
    return { email: request.email, token: token }
  }

  async loginUser(email: string): Promise<{ user: SocialUser }> {
    const sql: string = "SELECT USER_ID, USER_NAME, USER_LAST_NAME, USER_UNIQUE_NAME, REGISTRATION_DATE, EMAIL, PHONE, LOCATION_CODE FROM SOCIAL_USER WHERE UPPER(EMAIL) = UPPER(:email)"
    const result = await this.dataSource.query<SocialUser[]>(sql, [email])

    if (result.length === 0) throw new Error("Usuario no encontrado")
    
    return { user: result[0] }
  }

  async confirmAccount(token: string): Promise<{ message: string }> {
    // Buscar el usuario que coincida con el token
    const selectSql: string = "SELECT * FROM PENDING_USER WHERE TOKEN = :token"
    const result = await this.dataSource.query<PendingUser[]>(selectSql, [token])
    if (!result || result.length === 0) throw new Error("Token inválido o ya utilizado")
    const pendingUser = result[0]

    // Insertar el usuario en SOCIAL_USER
    const insertSql = `
        INSERT INTO SOCIAL_UD.SOCIAL_USER (USER_ID, USER_NAME, USER_LAST_NAME, USER_UNIQUE_NAME, REGISTRATION_DATE, EMAIL, PHONE, LOCATION_CODE)
        VALUES (:userId, :userName, :userLastName, :userUniqueName, SYSDATE, :email, :phone, :locationCode)
    `

    const insertParams = [
      pendingUser.USER_ID,
      pendingUser.USER_NAME,
      pendingUser.USER_LAST_NAME,
      pendingUser.USER_UNIQUE_NAME,
      pendingUser.EMAIL,
      pendingUser.PHONE,
      pendingUser.LOCATION_CODE
    ]

    await this.dataSource.query(insertSql, insertParams)

    // Eliminar el registro de PENDING_USER
    const deleteSql: string = "DELETE FROM SOCIAL_UD.PENDING_USER WHERE TOKEN = :token"
    await this.dataSource.query(deleteSql, [token])

    return { message: "Cuenta confirmada correctamente" }
  }

}
