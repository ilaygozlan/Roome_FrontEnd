/**
 * @module firebase
 * @description Firebase configuration and initialization module.
 * Sets up Firebase authentication and Firestore database with React Native persistence.
 * 
 * Features:
 * - Firebase app initialization
 * - Authentication setup with AsyncStorage persistence
 * - Firestore database initialization
 * 
 * @requires firebase/app
 * @requires firebase/auth
 * @requires firebase/firestore
 * @requires @react-native-async-storage/async-storage
 * 
 * @exports {Object} auth - Firebase authentication instance
 * @exports {Object} db - Firestore database instance
 */

/**
 * Firebase configuration object
 * @constant
 * @type {Object}
 * 
 * @property {string} apiKey - Firebase API key
 * @property {string} authDomain - Firebase auth domain
 * @property {string} projectId - Firebase project ID
 * @property {string} storageBucket - Firebase storage bucket
 * @property {string} messagingSenderId - Firebase messaging sender ID
 * @property {string} appId - Firebase application ID
 * 
 * @security_note
 * TODO: Move configuration to environment variables
 * for better security practices
 */
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
};

/**
 * Initialized Firebase app instance
 * @constant
 * @type {Object}
 */
const app = initializeApp(firebaseConfig);

/**
 * Firebase auth instance with AsyncStorage persistence
 * @constant
 * @type {Object}
 */
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

/**
 * Firestore database instance
 * @constant
 * @type {Object}
 */
const db = getFirestore(app);

export { auth, db }; 