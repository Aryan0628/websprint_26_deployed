export const notification = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const snapshot = await db.collection("notifications")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    if (snapshot.empty) {
      return res.json([]);
    }

    // Map docs to a clean array
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching from Firestore:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
}