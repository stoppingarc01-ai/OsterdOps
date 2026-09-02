import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

async function testDb() {
  const app = initializeApp({ projectId: "osterdops" }, "db-test");
  const db = getFirestore(app);
  try {
    console.log("Attempting Firestore collection fetch...");
    const snap = await db.collection("users").doc("test").get();
    console.log("Firestore success! Exists:", snap.exists);
  } catch (err) {
    console.error("Firestore FAILED:", err.message);
  }
}

testDb();
