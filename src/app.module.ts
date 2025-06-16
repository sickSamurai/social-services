import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { MailerModule } from "@nestjs-modules/mailer"
import { AuthenticationModule } from "./modules/authentication/authentication.module"
import { LocationModule } from "./modules/location/location.module"
import { AuthenticationService } from "./services/authentication/authentication.service"
import { LocationService } from "./services/location/location.service"
import { MailService } from "./services/mail/mail.service"
import { MainDatabaseConfig } from "./databases/main.config"


@Module({
  imports: [
    AuthenticationModule,
    LocationModule,
    MainDatabaseConfig,
    ConfigModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: "ldmckkb@gmail.com", pass: "lembotueynxuqhmj" }
      },
      defaults: { from: "SOCIAL UD <your-email@example.com>" }
    })
  ],
  controllers: [],
  providers: [AuthenticationService, LocationService, MailService]
})
export class AppModule {}
