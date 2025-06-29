import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule, ConfigService } from "@nestjs/config"

export const SocialDatabase = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: "oracle",
    host: config.get<string>("DB_HOST"),
    port: config.get<number>("DB_PORT")!,
    username: config.get<string>("DB_USER"),
    password: config.get<string>("DB_PASSWORD"),
    serviceName: config.get<string>("DB_SERVICE_NAME"),
    synchronize: false,
    autoLoadEntities: false
  })
})