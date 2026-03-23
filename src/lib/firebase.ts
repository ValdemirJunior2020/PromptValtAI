// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyDkTthwGyppE_4V5BkKREMsa_Vgz4WH0Ow",
  authDomain: "agents-name.firebaseapp.com",
  projectId: "agents-name",
  storageBucket: "agents-name.firebasestorage.app",
  messagingSenderId: "880994939187",
  appId: "1:880994939187:web:eadb11e0f0299c58da0e46",
  measurementId: "G-ZDN3HSC82K",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let authInstance;

if (Platform.OS === "web") {
  authInstance = getAuth(app);
  authInstance.setPersistence(browserLocalPersistence);
} else {
  try {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    authInstance = getAuth(app);
  }
}

const db = getFirestore(app);

export const auth = authInstance;
export { app, db };