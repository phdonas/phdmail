
import { db } from './firebase';
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    writeBatch
} from 'firebase/firestore';
import { Contact } from '../types';

const CONTACTS_COLLECTION = 'contacts';

export const getContacts = async (): Promise<Contact[]> => {
    const contactsCol = collection(db, CONTACTS_COLLECTION);
    const contactSnapshot = await getDocs(contactsCol);
    return contactSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Contact));
};

export const createContact = async (contact: Omit<Contact, 'id'>): Promise<Contact> => {
    const contactsCol = collection(db, CONTACTS_COLLECTION);
    const docRef = await addDoc(contactsCol, contact);
    return { ...contact, id: docRef.id };
};

export const updateContact = async (contact: Contact) => {
    const docRef = doc(db, CONTACTS_COLLECTION, contact.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...data } = contact;
    await updateDoc(docRef, data);
};

export const deleteContact = async (id: string) => {
    const docRef = doc(db, CONTACTS_COLLECTION, id);
    await deleteDoc(docRef);
};

export const importContacts = async (contacts: Omit<Contact, 'id'>[]) => {
    const batch = writeBatch(db);
    const contactsCol = collection(db, CONTACTS_COLLECTION);

    contacts.forEach(contact => {
        const docRef = doc(contactsCol);
        batch.set(docRef, contact);
    });

    await batch.commit();
};
