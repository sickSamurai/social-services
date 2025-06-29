import { MailerModule } from "@nestjs-modules/mailer"
import { ConfigModule, ConfigService } from "@nestjs/config"

export const MailerConfig = MailerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    transport: {
      host: config.get<string>("EMAIL_HOST"),
      port: config.get<number>("EMAIL_PORT")!,
      auth: {
        user: config.get<string>("EMAIL_ADDRESS"),
        pass: config.get<string>("EMAIL_PASSWORD")
      },
      secure: true
    },
    defaults: { from: "SOCIAL UD <your-email@example.com>" }
  })
})