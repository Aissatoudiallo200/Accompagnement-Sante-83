import axios from "axios";

// Template HTML aligné sur le design exact de la page d'accueil
const generateEmailTemplate = (code) => {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vérification de votre adresse email</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8faf9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">

      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 30px; box-shadow: 0 15px 45px rgba(23, 51, 42, 0.05); border: 1px solid #eef2f0; overflow: hidden;">

        <tr>
          <td style="padding: 35px 40px 25px 40px; background-color: #ffffff;">
            <table align="left" border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color: #2f8f6b; width: 44px; height: 44px; text-align: center; border-radius: 14px; vertical-align: middle;">
                  <span style="color: #ffffff; font-size: 22px; line-height: 44px;">♥</span>
                </td>
                <td style="padding-left: 12px; vertical-align: middle;">
                  <span style="display: block; font-size: 18px; font-weight: 700; color: #17332a; margin: 0; letter-spacing: -0.02em;">Accompagnement Santé 83</span>
                  <span style="display: block; font-size: 12px; color: #587269; margin: 0;">Entraide santé</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding: 20px 40px 40px 40px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8faf9; border-radius: 24px; padding: 30px; border: 1px solid #edf2f0;">
              <tr>
                <td>
                  <h1 style="font-size: 22px; color: #17332a; font-weight: 800; margin: 0 0 12px 0; letter-spacing: -0.02em;">Vérification de votre compte</h1>
                  <p style="font-size: 14px; line-height: 1.6; color: #587269; margin: 0 0 25px 0;">
                    Pour valider la création de votre espace et accéder à la plateforme d'entraide, veuillez saisir le code de sécurité à 6 chiffres ci-dessous :
                  </p>

                  <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 25px auto;">
                    <tr>
                      <td style="background-color: #ffffff; border: 1px solid rgba(47, 143, 107, 0.2); padding: 15px 40px; border-radius: 16px; text-align: center; box-shadow: 0 4px 12px rgba(47, 143, 107, 0.04);">
                        <span style="font-size: 30px; font-weight: 800; color: #2f8f6b; letter-spacing: 0.2em; font-family: Monaco, monospace;">${code}</span>
                      </td>
                    </tr>
                  </table>

                  <p style="font-size: 13px; line-height: 1.5; color: #738d83; margin: 0; text-align: center;">
                    Ce code est temporaire et valable quelques minutes seulement.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding: 35px 40px; background-color: #2f8f6b; text-align: left;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="padding-bottom: 20px;">
                  <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background-color: rgba(255, 255, 255, 0.2); width: 36px; height: 36px; text-align: center; border-radius: 10px; vertical-align: middle;">
                        <span style="color: #ffffff; font-size: 18px; line-height: 36px;">♥</span>
                      </td>
                      <td style="padding-left: 10px; vertical-align: middle;">
                        <span style="display: block; font-size: 16px; font-weight: 700; color: #ffffff; margin: 0;">Accompagnement santé 83</span>
                      </td>
                    </tr>
                  </table>
                  <p style="font-size: 13px; color: rgba(255, 255, 255, 0.8); margin: 10px 0 0 0; line-height: 1.5;">
                    Plateforme d'entraide et de partage d'expérience entre patients dans l'environnement hospitalier.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.15);">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="font-size: 11px; color: rgba(255, 255, 255, 0.7);">
                        © 2026 Accompagnement Santé 83 — Tous droits réservés
                      </td>
                      <td style="font-size: 11px; color: rgba(255, 255, 255, 0.7); text-align: right;">
                        Plateforme sécurisée et conforme RGPD
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>

    </body>
    </html>
  `;
};

export async function sendVerificationEmail(email, code) {
  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        name: "Accompagnement Santé 83",
        email: process.env.MAIL_FROM,
      },
      to: [{ email }],
      subject: "Code de vérification — Accompagnement Santé 83",
      htmlContent: generateEmailTemplate(code),
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );
}
