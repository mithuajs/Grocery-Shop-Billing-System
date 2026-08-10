// ========================================
// Firebase Configuration
// Grocery Shop Billing System
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyC45lErBqukWkSPcO4EMuLqG5PK3pcHX3g",
    authDomain: "grocery-shop-billing-system.firebaseapp.com",
    projectId: "grocery-shop-billing-system",
    storageBucket: "grocery-shop-billing-system.firebasestorage.app",
    messagingSenderId: "266121251405",
    appId: "1:266121251405:web:ab77cb5facf42e0cb8aa04"
};


// ========================================
// Initialize Firebase
// ========================================

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}


// ========================================
// Firebase Services
// ========================================

const auth = firebase.auth();
const db = firebase.firestore();


// ========================================
// Test
// ========================================

console.log("Firebase Connected Successfully!");