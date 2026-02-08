
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword} from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAli620FCykHYYzis4mAsL7RgdjyZ0yf3w",
  authDomain: "azeefit-gym.firebaseapp.com",
  projectId: "azeefit-gym",
  storageBucket: "azeefit-gym.appspot.com",
  messagingSenderId: "54154539925",
  appId: "1:54154539925:web:3fadcc1b1c858c151c7c9c",
  measurementId: "G-H2QFPM9R2T"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
