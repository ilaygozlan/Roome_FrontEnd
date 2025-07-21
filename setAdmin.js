const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function setAdmin(uid) {
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  console.log(`  User ${uid} is now an admin!`);
}

// Replace with your user's UID
setAdmin("xhnFAsR5o4SmWjYczjiKSSXcgxv2");
