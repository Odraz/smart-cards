import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  Timestamp,
  serverTimestamp,
  orderBy,
  limit,
  setDoc,
} from "firebase/firestore";
import { db } from "./config";
import type { CardSet, Card, UserSettings } from "@/types";

const CARD_SETS_COLLECTION = "cardSets";
const USERS_COLLECTION = "users";

// User Settings (API Key)
export async function saveUserApiKey(userId: string, apiKey: string): Promise<void> {
  const userDocRef = doc(db, USERS_COLLECTION, userId);
  await setDoc(userDocRef, { geminiApiKey: apiKey }, { merge: true });
}

export async function getUserApiKey(userId: string): Promise<string | null> {
  const userDocRef = doc(db, USERS_COLLECTION, userId);
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    const data = docSnap.data() as UserSettings;
    return data.geminiApiKey || null;
  }
  return null;
}


// Card Sets
export async function addCardSet(userId: string, setData: Omit<CardSet, "id" | "userId" | "createdAt" | "updatedAt">): Promise<string> {
  const newSet = {
    ...setData,
    userId,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };
  const docRef = await addDoc(collection(db, CARD_SETS_COLLECTION), newSet);
  return docRef.id;
}

export async function getUserCardSets(userId: string): Promise<CardSet[]> {
  const q = query(
    collection(db, CARD_SETS_COLLECTION),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CardSet));
}

export async function getCardSet(setId: string, userId: string): Promise<CardSet | null> {
  const docRef = doc(db, CARD_SETS_COLLECTION, setId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const cardSet = { id: docSnap.id, ...docSnap.data() } as CardSet;
    // Ensure the user owns this set
    if (cardSet.userId === userId) {
      return cardSet;
    }
  }
  return null;
}

export async function updateCardSet(setId: string, userId: string, data: Partial<Omit<CardSet, "id" | "userId" | "createdAt">>): Promise<void> {
  const docRef = doc(db, CARD_SETS_COLLECTION, setId);
  // Optional: Add a check to ensure user owns the doc before updating, though Firestore rules should handle this.
  const cardSetToUpdate = await getCardSet(setId, userId);
  if (!cardSetToUpdate) {
    throw new Error("Card set not found or permission denied.");
  }
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp() as Timestamp,
  });
}

export async function deleteCardSet(setId: string, userId: string): Promise<void> {
   // Optional: Add a check to ensure user owns the doc before deleting.
  const cardSetToDelete = await getCardSet(setId, userId);
  if (!cardSetToDelete) {
    throw new Error("Card set not found or permission denied.");
  }
  await deleteDoc(doc(db, CARD_SETS_COLLECTION, setId));
}

export const MAX_CARDS_PER_SET_AI = 16;
export const MAX_TEXT_LENGTH_AI = 15000;
export const AVAILABLE_LANGUAGES_AI = [
  { value: "English", label: "English" },
  { value: "Czech", label: "Czech" },
  { value: "German", label: "German" },
];
