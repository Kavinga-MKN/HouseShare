import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
    apiKey: "AIzaSyD_ikoHS0U7Saelaafdp2sR6yLdkfUbJJ0",
    authDomain: "houseshare-b6c03.firebaseapp.com",
    projectId: "houseshare-b6c03",
    storageBucket: "houseshare-b6c03.firebasestorage.app",
    messagingSenderId: "336193839084",
    appId: "1:336193839084:web:a400c220edbc870b4feac9",
    measurementId: "G-9192656WRL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
