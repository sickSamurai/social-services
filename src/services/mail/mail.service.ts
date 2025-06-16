import { Injectable } from "@nestjs/common"
import { MailerService } from "@nestjs-modules/mailer"


@Injectable()
export class MailService {
  constructor(private mailer: MailerService) {}

  async sendConfirmationEmail(email: string, token: string): Promise<boolean> {
    try {
      const confirmationUrl = `http://localhost:8080/api/authentication/confirm?token=${token}`
      await this.mailer.sendMail({
        to: email,
        subject: "[Social UD] Confirma tu cuenta",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c3e50;">¡Bienvenido a Social UD!</h1>
          <p>Gracias por registrarte. Para completar tu registro, por favor confirma tu cuenta haciendo clic en el siguiente enlace:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #3498db; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Confirmar mi cuenta
            </a>
          </div>
          
          <p>Si no solicitaste este registro, por favor ignora este mensaje.</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #7f8c8d;">
            <p>Atentamente,</p>
            <p>El equipo de Social UD</p>
          </div>
        </div>
      `
      })
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }
}