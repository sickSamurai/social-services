import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  await app.listen(process.env.PORT!)
}

void bootstrap().then(() => console.log(`El servidor inicio correctamente en el puerto ${process.env.PORT!}`))
