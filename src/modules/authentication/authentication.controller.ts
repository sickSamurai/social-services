import { Body, Controller, Get, InternalServerErrorException, NotFoundException, Param, Post, Query } from "@nestjs/common"
import { AuthenticationService } from "../../services/authentication/authentication.service"
import { EmailValidation } from "../../models/responses/EmailValidation"
import { CreateUserRequest } from "../../models/requests/CreateUserRequest"
import { RegisterResponse } from "../../models/responses/RegisterResponse"
import { MailService } from "../../services/mail/mail.service"
import { LoginResponse } from "../../models/responses/LoginResponse"
import { MessageResponse } from "../../models/responses/MessageResponse"
import { SendConfirmationEmailRequest } from "../../models/requests/SendConfirmationEmailRequest"

@Controller("api/authentication")
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService, private mailService: MailService) {}

  @Post("login")
  async login(@Body("email") email: string): Promise<LoginResponse> {
    try {
      return await this.authenticationService.loginUser(email)
    } catch (error) {
      if (error instanceof Error) throw new NotFoundException(error.message)
      else throw new InternalServerErrorException("Ocurrió un error desconocido al iniciar sesión")
    }
  }

  @Get("check/email/:email")
  async validateEmail(@Param("email") email: string): Promise<EmailValidation> {
    return await this.authenticationService.validateEmail(email)
  }

  @Post("register")
  async registerPending(@Body() request: CreateUserRequest): Promise<RegisterResponse> {
    return await this.authenticationService.registerPendingUser(request)

  }
  
  @Post("confirmation-email")
  async sendConfirmationEmail(@Body() request: SendConfirmationEmailRequest): Promise<MessageResponse> {
    if (await this.mailService.sendConfirmationEmail(request.email, request.token))
      return { message: "El email de confirmación fue enviado exitosamente" }
    else return { message: "Error inesperado al enviar el email" }
  }

  @Get("confirmation")
  async confirmAccount(@Query("token") token: string): Promise<MessageResponse> {
    try {
      return await this.authenticationService.confirmAccount(token)
    } catch (error) {
      if (error instanceof Error) throw new NotFoundException(error.message)
      else throw new InternalServerErrorException("Ocurrió un error desconocido al hacer la validación de la cuenta")
    }
  }
}
