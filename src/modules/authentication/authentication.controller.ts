import { Body, Controller, Get, InternalServerErrorException, NotFoundException, Param, Post, Query } from "@nestjs/common"
import { AuthenticationService } from "../../services/authentication/authentication.service"
import { EmailValidation } from "../../models/EmailValidation"
import { CreateUserRequest } from "../../models/CreateUserRequest"
import { RegisterResponse } from "../../models/RegisterResponse"
import { MailService } from "../../services/mail/mail.service"

@Controller("api/authentication")
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService, private mailService: MailService) {}

  @Post("login")
  async login(@Body("email") email: string): Promise<{ user: any }> {
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
  async sendConfirmationEmail(@Body() dto: { email: string, token: string }) {
    if (await this.mailService.sendConfirmationEmail(dto.email, dto.token))
      return { message: "El email de confirmación fue enviado exitosamente" }
    else return { message: "Error inesperado al enviar el email" }
  }

  @Get("confirmation")
  async confirmAccount(@Query("token") token: string): Promise<{ message: string }> {
    try {
      return await this.authenticationService.confirmAccount(token)
    } catch (error) {
      if (error instanceof Error) throw new NotFoundException(error.message)
      else throw new InternalServerErrorException("Ocurrió un error desconocido al hacer la validación de la cuenta")
    }
  }
}
