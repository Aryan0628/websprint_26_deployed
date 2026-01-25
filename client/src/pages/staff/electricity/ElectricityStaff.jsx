import React, { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  Camera,
  CheckCircle,
  Navigation,
  LogOut
} from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { getDatabase, ref, set, onDisconnect, remove } from "firebase/database";
import ngeohash from "ngeohash";
import { api } from "@/lib/api";

const db = getDatabase();

export default function ElectricityStaffDashboard() {
  const { logout, user, getAccessTokenSilently } = useAuth0();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [uploadingId, setUploadingId] = useState(null);

  // -----------------------------------
  // FETCH ELECTRICITY TASKS
  // -----------------------------------
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();

        const endpoint =
          activeTab === "active"
            ? "/api/electricity/staff/tasks/active"
            : "/api/electricity/staff/tasks/history";

        const res = await api.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setTasks(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchTasks();
  }, [user, activeTab, getAccessTokenSilently]);

  // -----------------------------------
  // GEO TRACKING → ELECTRICITY
  // -----------------------------------
  useEffect(() => {
    if (!user) return;

    let watchId = null;
    let currentRef = null;

    const updateLocation = (pos) => {
      const { latitude, longitude } = pos.coords;
      const geohash = ngeohash.encode(latitude, longitude, 5);

      const uid = user.sub.replace("|", "_");
      const path = `staff/electricity/${geohash}/${uid}`;
      const userRef = ref(db, path);

      const data = {
        name: user.name,
        email: user.email,
        picture: user.picture,
        coords: { lat: latitude, lng: longitude },
        status: "ONLINE",
        lastSeen: Date.now()
      };

      if (currentRef && currentRef.toString() !== userRef.toString()) {
        remove(currentRef);
      }

      currentRef = userRef;

      set(userRef, data);
      onDisconnect(userRef).remove();
    };

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(updateLocation);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (currentRef) remove(currentRef);
    };
  }, [user]);

  // -----------------------------------
  // RESOLVE TASK
  // -----------------------------------
  const handleUploadProof = async (taskId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingId(taskId);

    try {
      const token = await getAccessTokenSilently();
      const fd = new FormData();
      fd.append("image", file);
      fd.append("taskId", taskId);

      await api.post("/api/electricity/staff/tasks/resolve", fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      setTasks((p) => p.filter((t) => t.id !== taskId));
      alert("Resolved!");
    } catch (e) {
      alert("Upload failed");
    } finally {
      setUploadingId(null);
    }
  };

  const openMaps = (c) => {
    if (c?.lat)
      window.open(`https://maps.google.com?q=${c.lat},${c.lng}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto">

      {/* HEADER */}
      <div className="bg-slate-900 text-white p-6 rounded-b-3xl">
        <div className="flex justify-between">
          <h1 className="text-xl font-bold">{user?.name}</h1>
          <LogOut onClick={() => logout()} />
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-6 p-4">
        <button onClick={() => setActiveTab("active")}>Active</button>
        <button onClick={() => setActiveTab("history")}>History</button>
      </div>

      {/* TASKS */}
      <div className="p-4 space-y-4">
        {loading ? (
          <p>Loading...</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="bg-white p-4 rounded-xl">

              <h3 className="font-bold">{task.title}</h3>

              <p className="text-xs flex gap-1">
                <MapPin size={12} /> {task.location?.address}
              </p>

              {activeTab === "active" && (
                <div className="grid grid-cols-2 gap-2 mt-3">

                  <button onClick={() => openMaps(task.location)}>
                    <Navigation size={16} />
                  </button>

                  <label>
                    <Camera size={16} />
                    <input
                      hidden
                      type="file"
                      onChange={(e) => handleUploadProof(task.id, e)}
                    />
                  </label>

                </div>
              )}

              {task.status === "COMPLETED" && (
                <div className="text-green-600 text-xs flex gap-1 mt-2">
                  <CheckCircle size={14} /> Completed
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
