
import { db } from '../database.js';
import { contracts, deliverables, notifications, missions, bids, users } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';

export type ContractStatus = 'pending_signature' | 'active' | 'in_progress' | 'under_review' | 'completed' | 'disputed' | 'cancelled';

// Créer un nouveau contrat
export async function createContract(data: {
  mission_id: number;
  bid_id: number;
  client_id: number;
  provider_id: number;
  terms: any;
  deliverables: any[];
}) {
  try {
    const [contract] = await db.insert(contracts).values({
      ...data,
      status: 'pending_signature'
    }).returning();

    // Créer les livrables associés
    if (data.deliverables && data.deliverables.length > 0) {
      await db.insert(deliverables).values(
        data.deliverables.map(deliverable => ({
          contract_id: contract.id,
          title: deliverable.title,
          description: deliverable.description
        }))
      );
    }

    // Notifier les parties
    await createNotification(data.client_id, {
      type: 'contract_created',
      title: 'Contrat créé',
      message: 'Un nouveau contrat a été créé et attend votre signature',
      link: `/contracts/${contract.id}`
    });

    await createNotification(data.provider_id, {
      type: 'contract_created',
      title: 'Contrat créé',
      message: 'Un nouveau contrat a été créé et attend votre signature',
      link: `/contracts/${contract.id}`
    });

    return contract;
  } catch (error) {
    console.error('Erreur création contrat:', error);
    throw error;
  }
}

// Signer un contrat
export async function signContract(contractId: number, userId: number) {
  try {
    const contract = await db.query.contracts.findFirst({
      where: eq(contracts.id, contractId)
    });

    if (!contract) {
      throw new Error('Contrat non trouvé');
    }

    const now = new Date();
    let updateData: any = {};

    if (contract.client_id === userId && !contract.client_signed_at) {
      updateData.client_signed_at = now;
    } else if (contract.provider_id === userId && !contract.provider_signed_at) {
      updateData.provider_signed_at = now;
    } else {
      throw new Error('Non autorisé à signer ce contrat');
    }

    // Vérifier si les deux parties ont signé
    const updatedContract = await db.query.contracts.findFirst({
      where: eq(contracts.id, contractId)
    });

    if (updatedContract?.client_signed_at && updatedContract?.provider_signed_at) {
      updateData.status = 'active';
      updateData.start_date = now;
    }

    await db.update(contracts)
      .set(updateData)
      .where(eq(contracts.id, contractId));

    return { success: true };
  } catch (error) {
    console.error('Erreur signature contrat:', error);
    throw error;
  }
}

// Changer le statut d'un contrat
export async function transitionContract(contractId: number, newStatus: ContractStatus, userId: number) {
  try {
    const contract = await db.query.contracts.findFirst({
      where: eq(contracts.id, contractId)
    });

    if (!contract) {
      throw new Error('Contrat non trouvé');
    }

    // Vérifier les permissions
    if (contract.client_id !== userId && contract.provider_id !== userId) {
      throw new Error('Non autorisé');
    }

    // Valider la transition
    const validTransitions = getValidTransitions(contract.status);
    if (!validTransitions.includes(newStatus)) {
      throw new Error('Transition invalide');
    }

    let updateData: any = { status: newStatus, updated_at: new Date() };

    if (newStatus === 'completed') {
      updateData.actual_end_date = new Date();
    }

    await db.update(contracts)
      .set(updateData)
      .where(eq(contracts.id, contractId));

    // Notifier l'autre partie
    const otherUserId = contract.client_id === userId ? contract.provider_id : contract.client_id;
    await createNotification(otherUserId, {
      type: 'contract_status_changed',
      title: 'Statut du contrat modifié',
      message: `Le contrat est maintenant : ${newStatus}`,
      link: `/contracts/${contractId}`
    });

    return { success: true };
  } catch (error) {
    console.error('Erreur transition contrat:', error);
    throw error;
  }
}

// Soumettre un livrable
export async function submitDeliverable(deliverableId: number, userId: number, data: {
  file_urls: string[];
  description?: string;
}) {
  try {
    await db.update(deliverables)
      .set({
        status: 'submitted',
        file_urls: data.file_urls,
        submitted_at: new Date()
      })
      .where(eq(deliverables.id, deliverableId));

    // Notifier le client
    const deliverable = await db.query.deliverables.findFirst({
      where: eq(deliverables.id, deliverableId),
      with: { contract: true }
    });

    if (deliverable?.contract) {
      await createNotification(deliverable.contract.client_id, {
        type: 'deliverable_submitted',
        title: 'Livrable soumis',
        message: 'Un nouveau livrable a été soumis pour validation',
        link: `/contracts/${deliverable.contract.id}`
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur soumission livrable:', error);
    throw error;
  }
}

// Valider/Rejeter un livrable
export async function reviewDeliverable(deliverableId: number, userId: number, data: {
  approved: boolean;
  feedback?: string;
}) {
  try {
    await db.update(deliverables)
      .set({
        status: data.approved ? 'approved' : 'rejected',
        feedback: data.feedback,
        reviewed_at: new Date()
      })
      .where(eq(deliverables.id, deliverableId));

    return { success: true };
  } catch (error) {
    console.error('Erreur validation livrable:', error);
    throw error;
  }
}

// Obtenir les transitions valides
function getValidTransitions(currentStatus: string): ContractStatus[] {
  const transitions: Record<string, ContractStatus[]> = {
    'pending_signature': ['active', 'cancelled'],
    'active': ['in_progress', 'cancelled'],
    'in_progress': ['under_review', 'disputed', 'cancelled'],
    'under_review': ['completed', 'in_progress', 'disputed'],
    'completed': [],
    'disputed': ['in_progress', 'cancelled'],
    'cancelled': []
  };

  return transitions[currentStatus] || [];
}

// Créer une notification
async function createNotification(userId: number, data: {
  type: string;
  title: string;
  message: string;
  link?: string;
}) {
  await db.insert(notifications).values({
    user_id: userId,
    ...data
  });
}
