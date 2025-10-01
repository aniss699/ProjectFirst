
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(user: { name: string; email: string }) {
  try {
    await resend.emails.send({
      from: 'SwipDEAL <noreply@swideal.com>',
      to: [user.email],
      subject: '🎉 Bienvenue sur SwipDEAL !',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Bienvenue ${user.name} !</h1>
          <p>Merci de rejoindre SwipDEAL, la plateforme qui connecte clients et prestataires.</p>
          <p>Vous pouvez maintenant :</p>
          <ul>
            <li>🎯 Publier vos missions</li>
            <li>💼 Trouver des prestataires qualifiés</li>
            <li>⭐ Consulter les avis et évaluations</li>
          </ul>
          <a href="https://swideal.com/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
            Accéder à mon tableau de bord
          </a>
          <p style="color: #666; margin-top: 32px;">
            L'équipe SwipDEAL
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Erreur envoi email de bienvenue:', error);
  }
}

export async function sendNewBidEmail(client: { name: string; email: string }, bid: any, mission: any) {
  try {
    await resend.emails.send({
      from: 'SwipDEAL <noreply@swideal.com>',
      to: [client.email],
      subject: `💼 Nouvelle offre pour "${mission.title}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Nouvelle offre reçue !</h1>
          <p>Bonjour ${client.name},</p>
          <p>Vous avez reçu une nouvelle offre pour votre mission <strong>"${mission.title}"</strong>.</p>
          
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3>Détails de l'offre :</h3>
            <p><strong>Prix proposé :</strong> ${bid.price}€</p>
            <p><strong>Délai :</strong> ${bid.delivery_days} jours</p>
            <p><strong>Message :</strong> ${bid.message}</p>
          </div>

          <a href="https://swideal.com/missions/${mission.id}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
            Voir l'offre
          </a>
          
          <p style="color: #666; margin-top: 32px;">
            L'équipe SwipDEAL
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Erreur envoi email nouvelle offre:', error);
  }
}

export async function sendBidAcceptedEmail(provider: { name: string; email: string }, mission: any) {
  try {
    await resend.emails.send({
      from: 'SwipDEAL <noreply@swideal.com>',
      to: [provider.email],
      subject: `🎉 Votre offre a été acceptée !`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Félicitations !</h1>
          <p>Bonjour ${provider.name},</p>
          <p>Excellente nouvelle ! Votre offre pour la mission <strong>"${mission.title}"</strong> a été acceptée.</p>
          
          <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #16a34a;">
            <h3>Prochaines étapes :</h3>
            <ol>
              <li>Signez le contrat</li>
              <li>Commencez le travail</li>
              <li>Livrez selon les délais convenus</li>
            </ol>
          </div>

          <a href="https://swideal.com/missions/${mission.id}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
            Accéder au contrat
          </a>
          
          <p style="color: #666; margin-top: 32px;">
            L'équipe SwipDEAL
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Erreur envoi email offre acceptée:', error);
  }
}

export async function sendMissionCompletedEmail(client: { name: string; email: string }, mission: any) {
  try {
    await resend.emails.send({
      from: 'SwipDEAL <noreply@swideal.com>',
      to: [client.email],
      subject: `✅ Mission "${mission.title}" terminée`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Mission terminée !</h1>
          <p>Bonjour ${client.name},</p>
          <p>La mission <strong>"${mission.title}"</strong> a été marquée comme terminée.</p>
          
          <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3>N'oubliez pas de :</h3>
            <ul>
              <li>⭐ Laisser un avis sur le prestataire</li>
              <li>💰 Libérer le paiement si tout est conforme</li>
              <li>📝 Valider les livrables finaux</li>
            </ul>
          </div>

          <a href="https://swideal.com/missions/${mission.id}?tab=review" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
            Laisser un avis
          </a>
          
          <p style="color: #666; margin-top: 32px;">
            L'équipe SwipDEAL
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Erreur envoi email mission terminée:', error);
  }
}

export async function sendNewMessageEmail(recipient: { name: string; email: string }, sender: { name: string }, message: string) {
  try {
    await resend.emails.send({
      from: 'SwipDEAL <noreply@swideal.com>',
      to: [recipient.email],
      subject: `💬 Nouveau message de ${sender.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Nouveau message</h1>
          <p>Bonjour ${recipient.name},</p>
          <p>Vous avez reçu un nouveau message de <strong>${sender.name}</strong> :</p>
          
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #2563eb;">
            <p style="margin: 0;">${message}</p>
          </div>

          <a href="https://swideal.com/messages" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
            Répondre au message
          </a>
          
          <p style="color: #666; margin-top: 32px;">
            L'équipe SwipDEAL
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Erreur envoi email nouveau message:', error);
  }
}

export async function sendContractSignedEmail(user: { name: string; email: string }, contract: any) {
  try {
    await resend.emails.send({
      from: 'SwipDEAL <noreply@swideal.com>',
      to: [user.email],
      subject: `📋 Contrat signé - Mission peut commencer`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Contrat signé !</h1>
          <p>Bonjour ${user.name},</p>
          <p>Le contrat pour la mission a été signé par toutes les parties. Le travail peut maintenant commencer !</p>
          
          <a href="https://swideal.com/contracts/${contract.id}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
            Voir le contrat
          </a>
          
          <p style="color: #666; margin-top: 32px;">
            L'équipe SwipDEAL
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Erreur envoi email contrat signé:', error);
  }
}
