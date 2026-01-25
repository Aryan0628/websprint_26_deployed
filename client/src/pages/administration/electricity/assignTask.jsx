import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom"; 
import { getDatabase, ref, onValue, off } from "firebase/database";
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  CheckCircle2,
  Send
} from "lucide-react";
import { api } from "@/lib/api"; 
import { useAuth0 } from "@auth0/auth0-react";

export default function AssignElectricityTask() {
  const { geoHash } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getAccessTokenSilently } = useAuth0();

  const [searchParams] = useSearchParams();
  const reportIdFromUrl = searchParams.get("reportId");

  const prefill = location.state?.prefill || {};

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [formData, setFormData] = useState({
    title: prefill.title || "", 
    description: prefill.description || "",
    priority: prefill.priority || "MEDIUM",
    deadline: "",
    address: prefill.address || "Zone Center",
    lng: prefill.location?.lng,
    lat: prefill.location?.lat,
    reporterEmail: prefill.email,
    imageUrl: prefill.imageUrl
  });

  // -----------------------------------------
  // Load Electricity Staff From Firebase
  // -----------------------------------------
  useEffect(() => {
    const db = getDatabase();
    const zoneRef = ref(db, `staff/electricity/${geoHash}`);

    const listener = onValue(zoneRef, (snapshot) => {
      const data = snapshot.val();
      setStaffList(data ? Object.entries(data).map(([k, v]) => ({ id: k.replace('_', '|'), ...v })) : []);
      setLoading(false);
    });

    return () => off(zoneRef, listener);
  }, [geoHash]);

  // -----------------------------------------
  // Assign Task
  // -----------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaff) return alert("Please select staff");

    setSubmitting(true);
    try {
      const token = await getAccessTokenSilently();

      await api.post("/api/staff/tasks/assign", {
        ...formData,
        reportId: reportIdFromUrl || prefill.reportId || null,
        department: "electricity",
        assignedTo: selectedStaff.id,
        assignedToName: selectedStaff.name,
        zoneGeohash: geoHash,
        email: prefill.reporterEmail,
        imageUrl: prefill.imageUrl,
        reportGeohash: prefill.reportGeohash,
        location: {
          lat: formData.lat,
          lng: formData.lng
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Electricity task assigned!");
      navigate(-1);

    } catch (err) {
      console.error(err);
      alert("Assignment failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <button onClick={() => navigate(-1)} className="flex gap-2 mb-6">
        <ArrowLeft /> Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Assign Electricity Task</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Staff */}
        <div>
          <h3 className="font-bold mb-4 flex gap-2 items-center">
            <User className="w-4 h-4" /> Staff ({staffList.length})
          </h3>

          {loading ? "Loading..." : staffList.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStaff(s)}
              className={`w-full mb-2 p-3 rounded border ${
                selectedStaff?.id === s.id ? "bg-black text-white" : "bg-white"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white p-6 rounded space-y-4">

          {reportIdFromUrl && (
            <div className="text-xs font-mono text-emerald-600 flex gap-1">
              <CheckCircle2 className="w-3 h-3" /> Linked to Report
            </div>
          )}

          <input
            className="border p-2 w-full"
            value={formData.title}
            onChange={(e) => setFormData({...formData,title:e.target.value})}
          />

          <textarea
            className="border p-2 w-full"
            value={formData.description}
            onChange={(e) => setFormData({...formData,description:e.target.value})}
          />

          <button
            disabled={submitting}
            className="w-full bg-black text-white py-3 rounded flex justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Assigning..." : "Assign"}
          </button>

        </form>
      </div>
    </div>
  );
}
