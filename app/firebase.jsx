import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCGucSUapSIUa_ykXy0K8tl6XR-ITXRj3o",
  authDomain: "Roome.firebaseapp.com",
  projectId: "roome-b1dad",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "182842175967",
  appId: "1:182842175967:ios:aaa6388accdc9d55df146a"
};const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});


const db = getFirestore(app);

export { auth, db };
export default app;