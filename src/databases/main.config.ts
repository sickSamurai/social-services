import { TypeOrmModule } from "@nestjs/typeorm"

export const MainDatabaseConfig = TypeOrmModule.forRoot({
  type: "oracle",
  host: "localhost",
  port: 1521,
  username: "SOCIAL_UD",
  password: "Penguins1223",
  serviceName: "XEPDB1",
  synchronize: false,
  autoLoadEntities: false
})