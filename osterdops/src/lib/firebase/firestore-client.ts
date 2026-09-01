"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { getFirebaseFirestore } from "./client";

/**
 * Re-export core Firestore client functions for convenience.
 */
export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
};

/**
 * React Hook: Listen to a live Firestore Document.
 */
export function useFirestoreDoc<T = DocumentData>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!path) return;

    const db = getFirebaseFirestore();
    const docRef = doc(db, path);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error(`[Firestore useFirestoreDoc error for ${path}]:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [path]);

  return { data: path ? data : null, loading: path ? loading : false, error };
}

/**
 * React Hook: Listen to a live Firestore Collection with optional query constraints.
 */
export function useFirestoreCollection<T = DocumentData>(
  collectionPath: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(Boolean(collectionPath));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!collectionPath) return;

    const db = getFirebaseFirestore();
    const colRef = collection(db, collectionPath);
    const q = query(colRef, ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as T);
        });
        setData(items);
        setLoading(false);
      },
      (err) => {
        console.error(`[Firestore useFirestoreCollection error for ${collectionPath}]:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionPath, constraints]);

  return { data: collectionPath ? data : [], loading: collectionPath ? loading : false, error };
}
