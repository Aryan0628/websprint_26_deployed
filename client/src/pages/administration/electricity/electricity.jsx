import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  ArrowLeft,
  LogOut,
  Zap,
  MapPin,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  Truck,
  Inbox,
} from "lucide-react";

import { api } from "@/lib/api";


export default function ElectricityAdmin() {
  const navigate = useNavigate();
  const { logout } = useAuth0();

  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);
  const [activeTab, setActiveTab] = useState("current");

  // --------------------------------------------------
  // Load Electricity Reports
  // --------------------------------------------------
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await api.get("/api/electricity/reports");
        setZones(res.data?.zones || []);
      } catch (err) {
        console.error("Electricity fetch failed:", err);
        setZones([]);
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
  }, []);

  // --------------------------------------------------
  // Priority Sorting
  // --------------------------------------------------
  const priorityMap = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };

  // --------------------------------------------------
  // Status Buckets
  // --------------------------------------------------
  const { currentReports, assignedReports, resolvedReports } = useMemo(() => {
    if (!selectedZone)
      return { currentReports: [], assignedReports: [], resolvedReports: [] };

    const reports = selectedZone.reports || [];

    const current = reports.filter(
      (r) => r.status === "OPEN" || !r.status
    );
    const assigned = reports.filter(
      (r) => r.status === "ASSIGNED" || r.status === "IN_PROGRESS"
    );
    const resolved = reports.filter((r) => r.status === "RESOLVED");

    const sort = (list) =>
      list.sort(
        (a, b) =>
          (priorityMap[a.severity] ?? 99) -
          (priorityMap[b.severity] ?? 99)
      );

    return {
      currentReports: sort(current),
      assignedReports: sort(assigned),
      resolvedReports: sort(resolved),
    };
  }, [selectedZone]);

  // --------------------------------------------------
  // Badge Helper
  // --------------------------------------------------
  const getStatusBadge = (status) => {
    if (status === "RESOLVED")
      return { icon: CheckCircle2, text: "Resolved" };

    if (status === "ASSIGNED" || status === "IN_PROGRESS")
      return { icon: Truck, text: "Assigned" };

    return { icon: Clock, text: "Open" };
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <ArrowLeft
            className="cursor-pointer"
            onClick={() =>
              selectedZone ? setSelectedZone(null) : navigate("/administration")
            }
          />
          <Zap />
          <h1 className="font-bold">Electricity Admin</h1>
        </div>

        <button onClick={() => logout()}>
          <LogOut />
        </button>
      </header>

      {/* Body */}
      <main className="p-6">
        {!selectedZone ? (
          <>
            <h2 className="text-xl mb-4">Zones</h2>

            {loading ? (
              <p>Loading...</p>
            ) : zones.length === 0 ? (
              <div className="text-slate-400 flex items-center gap-2">
                <Inbox /> No electricity complaints
              </div>
            ) : (
              zones.map((z) => (
                <div
                  key={z.zoneId}
                  onClick={() => setSelectedZone(z)}
                  className="bg-white p-4 mb-3 rounded cursor-pointer flex justify-between"
                >
                  <div>
                    <p className="font-bold">Zone {z.zoneId}</p>
                    <p className="text-xs text-slate-400">{z.geohash}</p>
                  </div>

                  <ChevronRight />
                </div>
              ))
            )}
          </>
        ) : (
          <>
            <div className="flex gap-4 mb-4">
              {["current", "assigned", "resolved"].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-3 py-1 ${
                    activeTab === t ? "border-b-2 border-black" : ""
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {(activeTab === "current"
              ? currentReports
              : activeTab === "assigned"
              ? assignedReports
              : resolvedReports
            ).map((r) => {
              const badge = getStatusBadge(r.status);
              const Icon = badge.icon;

              return (
                <div key={r.id} className="bg-white p-4 mb-3 rounded">
                  <p className="font-bold">{r.title}</p>
                  <p className="text-sm text-slate-500">{r.address}</p>

                  <div className="flex items-center gap-2 text-xs my-2">
                    <Icon className="w-4 h-4" />
                    {badge.text}
                  </div>

                  {activeTab === "current" && (
                    <button
                      onClick={() =>
                        navigate(`/assign/electricity/${selectedZone.geohash}`, {
                          state: {
                            prefill: {
                              reportId: r.id,
                              title: r.title,
                              priority: r.severity,
                              department: "electricity",
                              location: r.location,
                            },
                          },
                        })
                      }
                      className="bg-black text-white px-3 py-1 text-xs rounded"
                    >
                      Assign
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/track/${r.id}`)}
                    className="ml-2 border px-3 py-1 text-xs rounded"
                  >
                    <ExternalLink className="inline w-3 h-3 mr-1" />
                    Track
                  </button>
                </div>
              );
            })}
          </>
        )}
      </main>
    </div>
  );
}
