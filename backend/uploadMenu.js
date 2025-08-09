const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Load service account key (downloaded from Firebase Console)
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Read menu JSON file
const menuData = JSON.parse(fs.readFileSync(path.join(__dirname, "menu.json"), "utf8"));

async function uploadMenu() {
  const batch = db.batch();
  const menuCollection = db.collection("menu");

  menuData.forEach(item => {
    const docRef = menuCollection.doc(); // Auto ID
    batch.set(docRef, item);
  });

  await batch.commit();
  console.log(" Menu uploaded successfully!");
}

uploadMenu().catch(console.error);