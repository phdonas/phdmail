
import { db } from './firebase';
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
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

export const createCampaign = async (campaign: Omit<Campaign, 'id'>): Promise<Campaign> => {
  const campaignsCol = collection(db, CAMPAIGNS_COLLECTION);
  const docRef = await addDoc(campaignsCol, campaign);
  return { ...campaign, id: docRef.id };
};

export const updateCampaign = async (campaign: Campaign) => {
  const docRef = doc(db, CAMPAIGNS_COLLECTION, campaign.id);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...data } = campaign;
  await updateDoc(docRef, data);
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
  };
  // @ts-ignore - status is explicitly set to 'draft' which matches CampaignStatus
  return await createCampaign(newCampaignData);
};
