// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAR98cup8pbIDbUFKfAqnDZFt-XtVCU3Og",
  authDomain: "kanbanboardapp-7a720.firebaseapp.com",
  projectId: "kanbanboardapp-7a720",
  storageBucket: "kanbanboardapp-7a720.firebasestorage.app",
  messagingSenderId: "268475123564",
  appId: "1:268475123564:web:0cd122cdc1f71dc3e15549",
  measurementId: "G-QCXB3EEVBL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
