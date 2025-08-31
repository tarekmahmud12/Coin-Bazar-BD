// ======================= Firebase SDK Import =======================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection, 
    query, 
    where, 
    getDocs, 
    orderBy, 
    serverTimestamp, 
    increment 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import { 
    getAuth, 
    signInAnonymously, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// ======================= Firebase Config =======================
const firebaseConfig = {
    apiKey: "AIzaSyBoTBGXZwfVzmqGQDtnDki6TJJ_PhvrfRY",
    authDomain: "coin-bazar-bd.firebaseapp.com",
    projectId: "coin-bazar-bd",
    storageBucket: "coin-bazar-bd.appspot.com", // ✅ এখানে `.appspot.com` ব্যবহার করতে হবে
    messagingSenderId: "442260048724",
    appId: "1:442260048724:web:5d1f2eb6b47792ce4c96c1",
    measurementId: "G-D9GT7879XN"
};

// ======================= Firebase Initialize =======================
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ======================= Firestore Helper Exports =======================
// এগুলো এক্সপোর্ট করলে `app.js` ফাইলে সহজে ব্যবহার করতে পারবে
export {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    orderBy,
    serverTimestamp,
    increment,
    signInAnonymously,
    onAuthStateChanged
};