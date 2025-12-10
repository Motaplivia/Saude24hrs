// Firebase Configuration
// Configuração do Firebase para o sistema médico

import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBeI09lpi8sJlHOT0LK9elE0UH5HMW23zk",
  authDomain: "sistemamedico-f2dc6.firebaseapp.com",
  projectId: "sistemamedico-f2dc6",
  storageBucket: "sistemamedico-f2dc6.firebasestorage.app",
  messagingSenderId: "566230763890",
  appId: "1:566230763890:web:503bc93d5b0f6e1912f5eb",
  measurementId: "G-95SM08M98W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
// Usa initializeFirestore para melhor compatibilidade com React Native
let db;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true, // Para melhor compatibilidade com React Native
  });
} catch (error) {
  // Se já foi inicializado, apenas obtém a referência
  db = getFirestore(app);
}

export { db };
export default app;

