import { db } from './firebase';
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where
} from 'firebase/firestore';
import { LinkItem } from '../types';

const LINKS_COLLECTION = 'links';

export const getLinks = async (includeArchived = false): Promise<LinkItem[]> => {
    const linksCol = collection(db, LINKS_COLLECTION);
    const q = includeArchived 
        ? linksCol 
        : query(linksCol, where('archived', '!=', true));
    
    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LinkItem));
    if (!includeArchived) {
        return items.filter(item => !item.archived);
    }
    return items;
};

export const createLink = async (link: Omit<LinkItem, 'id'>): Promise<LinkItem> => {
    const linksCol = collection(db, LINKS_COLLECTION);
    const docRef = await addDoc(linksCol, {
        ...link,
        archived: link.archived || false
    });
    return { ...link, id: docRef.id };
};

export const updateLink = async (link: LinkItem): Promise<void> => {
    const docRef = doc(db, LINKS_COLLECTION, link.id);
    const { id, ...data } = link;
    await updateDoc(docRef, data);
};

export const deleteLink = async (id: string): Promise<void> => {
    const docRef = doc(db, LINKS_COLLECTION, id);
    await deleteDoc(docRef);
};

export const archiveLink = async (id: string, archived: boolean): Promise<void> => {
    const docRef = doc(db, LINKS_COLLECTION, id);
    await updateDoc(docRef, { archived });
};
