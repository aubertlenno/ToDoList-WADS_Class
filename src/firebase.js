// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAxrDAwhAUHLDT2wXeROAZ21LEYxo-ISm4",
  authDomain: "lenno-wads-todo-app.firebaseapp.com",
  projectId: "lenno-wads-todo-app",
  storageBucket: "lenno-wads-todo-app.appspot.com",
  messagingSenderId: "752046655040",
  appId: "1:752046655040:web:0da5d435cd547e6e4181a5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service & Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
