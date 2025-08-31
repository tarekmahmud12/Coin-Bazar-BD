import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBoTBGXZwfVzmqGQDtnDki6TJJ_PhvrfRY",
    authDomain: "coin-bazar-bd.firebaseapp.com",
    databaseURL: "https://coin-bazar-bd-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "coin-bazar-bd",
    storageBucket: "coin-bazar-bd.firebasestorage.app",
    messagingSenderId: "442260048724",
    appId: "1:442260048724:web:5d1f2eb6b47792ce4c96c1",
    measurementId: "G-D9GT7879XN"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);