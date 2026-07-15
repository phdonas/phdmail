
import { db } from './firebase';
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { Campaign } from '../types';

const CAMPAIGNS_COLLECTION = 'campaigns';

export const getCampaigns = async (): Promise<Campaign[]> => {
  const campaignsCol = collection(db, CAMPAIGNS_COLLECTION);
  const q = query(campaignsCol, orderBy('sentAt', 'desc'));
  // Note: 'sentAt' might be undefined for drafts, so we might need a better sort or composite index.
  // For now, let's just get all and sort in memory if needed, or rely on simple queries.
  // Actually, let's just fetch all.
  const campaignSnapshot = await getDocs(campaignsCol);
  return campaignSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Campaign));
};

export const getCampaignById = async (id: string): Promise<Campaign | undefined> => {
  const docRef = doc(db, CAMPAIGNS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id } as Campaign;
  }
  return undefined;
};

// Helper to remove undefined fields recursively which Firestore rejects
const cleanData = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => cleanData(item));
  }
  
  const newObj: Record<string, any> = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      newObj[key] = cleanData(obj[key]);
    }
  });
  return newObj;
};

export const createCampaign = async (campaign: Omit<Campaign, 'id'>): Promise<Campaign> => {
  const campaignsCol = collection(db, CAMPAIGNS_COLLECTION);
  const dataToSave = cleanData({
    ...campaign,
    createdAt: new Date().toISOString()
  });
  const docRef = await addDoc(campaignsCol, dataToSave);
  return { ...campaign, id: docRef.id };
};

export const updateCampaign = async (campaign: Campaign) => {
  const docRef = doc(db, CAMPAIGNS_COLLECTION, campaign.id);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...data } = campaign;
  const dataToSave = cleanData(data);
  
  // Wrap setDoc in a Promise.race with an 8-second timeout to prevent silent hanging
  const writePromise = setDoc(docRef, dataToSave, { merge: true });
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Tempo limite excedido ao salvar dados no Firestore (Timeout de 8s). Isso pode ser causado por bloqueadores de conteúdo/AdBlockers ou instabilidade na conexão.")), 8000)
  );

  await Promise.race([writePromise, timeoutPromise]);
};

export const deleteCampaign = async (id: string) => {
  const docRef = doc(db, CAMPAIGNS_COLLECTION, id);
  await deleteDoc(docRef);
};

export const cloneCampaign = async (campaign: Campaign) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...data } = campaign;
  const newCampaignData = {
    ...data,
    name: `${campaign.name} (Cópia)`,
    status: 'draft',
    sentAt: undefined,
    stats: undefined,
    sentCount: 0,
    failedCount: 0,
    totalRecipients: 0,
    failedResults: []
  };
  // @ts-ignore - status is explicitly set to 'draft' which matches CampaignStatus
  return await createCampaign(newCampaignData);
};

export const subscribeToCampaigns = (callback: (campaigns: Campaign[]) => void): Unsubscribe => {
  const campaignsCol = collection(db, CAMPAIGNS_COLLECTION);
  // Remove orderBy causing draft exclusion
  const q = query(campaignsCol);

  return onSnapshot(q, (snapshot) => {
    const campaigns = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as Campaign));

    // Sort client-side: Drafts (no sentAt) first, then by date descending
    campaigns.sort((a, b) => {
      const getSeconds = (date: any) => {
        if (!date) return Number.MAX_SAFE_INTEGER;
        if (date.seconds) return date.seconds;
        // Fallback if somehow string or Date object
        if (typeof date === 'string') return new Date(date).getTime() / 1000;
        return 0;
      };
      return getSeconds(b.sentAt) - getSeconds(a.sentAt);
    });

    callback(campaigns);
  });
};

export const getCampaignClicks = async (campaignId: string): Promise<Array<{ email: string; url: string; clickedAt: any }>> => {
  const clicksCol = collection(db, CAMPAIGNS_COLLECTION, campaignId, 'clicks');
  const snap = await getDocs(clicksCol);
  return snap.docs.map(doc => doc.data() as any);
};
