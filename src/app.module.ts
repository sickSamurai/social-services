import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { SocialDatabase } from "./config/databases/social.database"
import { MailerConfig } from "./config/mailer/mailer.config"
import { AuthenticationModule } from "./modules/authentication/authentication.module"
import { LocationModule } from "./modules/location/location.module"
import { AuthenticationService } from "./services/authentication/authentication.service"
import { LocationService } from "./services/location/location.service"
import { MailService } from "./services/mail/mail.service"


@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env.development" }),
    MailerConfig,
    SocialDatabase,
    AuthenticationModule,
    LocationModule
  ],
  providers: [AuthenticationService, LocationService, MailService]
})
export class AppModule {}