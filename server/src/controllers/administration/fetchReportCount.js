import { db } from "../../firebaseadmin/firebaseadmin.js";

export const fetchReportCount = async (req, res) => {
  try {
    // We use .count() to perform the calculation on the database server
    const [
      wasteAgg,
      waterAgg,
      infraAgg,
      electricityAgg,
    ] = await Promise.all([
      db.collectionGroup("userReports")
        .where("assigned_category", "==", "WASTE")
        .count()
        .get(),

      db.collectionGroup("userReports")
        .where("assigned_category", "==", "WATER")
        .count()
        .get(),

      db.collectionGroup("userReports")
        .where("assigned_category", "==", "INFRASTRUCTURE")
        .count()
        .get(),

      db.collectionGroup("userReports")
        .where("assigned_category", "==", "ELECTRICITY")
        .count()
        .get(),
    ]);

    return res.status(200).json({
      waste: wasteAgg.data().count,
      water: waterAgg.data().count,
      infrastructure: infraAgg.data().count,
      electricity: electricityAgg.data().count, 
    });

  } catch (err) {
    console.error("Error fetching report counts:", err);
    return res.status(500).json({ error: "Failed to fetch report counts" });
  }
};