const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { title, list, urgent, by, isPrivate } = JSON.parse(event.body);
    if (isPrivate) return { statusCode: 200, body: "Private task skipped" };

    const db = admin.firestore();
    const snap = await db.collection("tokens").get();

    const targetTokens = [];
    snap.forEach((doc) => {
      const data = doc.data();
      if (!data.token) return;
      if (data.name && by && data.name.trim().toLowerCase() === by.trim().toLowerCase()) return;
      const follows = Array.isArray(data.follow) ? data.follow : [];
      if (list === "Generale" || follows.includes(list)) {
        targetTokens.push(data.token);
      }
    });

    if (targetTokens.length === 0) {
      return { statusCode: 200, body: "No recipients" };
    }

    const prefix = urgent ? "🔴 URGENTE · " : "❄️ ";
    await admin.messaging().sendEachForMulticast({
      tokens: targetTokens,
      data: {
        title: `${prefix}${list}`,
        body: `${by}: ${title}`
      },
      apns: {
        headers: { "apns-priority": "10" },
        payload: {
          aps: {
            alert: {
              title: `${prefix}${list}`,
              body: `${by}: ${title}`
            },
            sound: "default"
          }
        }
      }
    });

    return { statusCode: 200, body: "Sent" };
  } catch (err) {
    console.error("Push error:", err);
    return { statusCode: 500, body: err.message };
  }
};
