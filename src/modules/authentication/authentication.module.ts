import { Module } from "@nestjs/common"
import { AuthenticationController } from "./authentication.controller"
import { AuthenticationService } from "../../services/authentication/authentication.service"
import { MailService } from "../../services/mail/mail.service"

@Module({
  imports: [],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, MailService]
})
export class AuthenticationModule {
}
