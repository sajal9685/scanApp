import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { LogOut, RefreshCw, ChevronDown } from "lucide-react";
import "./Dashboard.css";

const AUTO_LOGOUT_HOURS = 8; // Change to 10 if needed

const Dashboard = () => {
  const [visits, setVisits] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedEmail, setExpandedEmail] = useState(null);
  const [statsData, setStatsData] = useState({
    totalDevices: 0,
    totalVisits: 0,
    avgDuration: "0 mins",
    lastUpdate: null,
  });
  const [sortConfig, setSortConfig] = useState({ key: "scanTime", direction: "desc" });
  const navigate = useNavigate();

  const calculateDurationMinutes = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    return Math.floor((now - start) / (1000 * 60));
  };

  const autoLogoutStaleSessions = async (sessions) => {
    const now = new Date();

    // Check sessions and update Firestore if they exceed the limit
    const updates = sessions
      .filter((session) => {
        const scanTime = new Date(session.scanTime);
        const durationHours = (now - scanTime) / (1000 * 60 * 60);
        return durationHours >= AUTO_LOGOUT_HOURS && session.isSessionActive;
      })
      .map(async (staleSession) => {
        try {
          const sessionDocRef = doc(db, "visits", staleSession.id);
          await updateDoc(sessionDocRef, {
            isSessionActive: false,
            exitTime: now.toISOString(),
            exitLocation: { latitude: "Auto", longitude: "Auto" }, // Placeholder exit location
            duration: `${AUTO_LOGOUT_HOURS * 60} mins`, // Update duration
          });
        } catch (error) {
          console.error(`Error updating session ${staleSession.id}:`, error);
        }
      });

    await Promise.all(updates);
  };

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const visitsSnapshot = await getDocs(collection(db, "visits"));
      const visitsData = visitsSnapshot.docs.map((doc) => {
        const scanTime = new Date(doc.data().scanTime || Date.now());
        const exitTime = doc.data().exitTime ? new Date(doc.data().exitTime) : null;

        const durationMinutes = exitTime
          ? Math.floor((exitTime - scanTime) / (1000 * 60))
          : calculateDurationMinutes(scanTime);

        return {
          id: doc.id,
          userName: doc.data().userName || "Unknown User",
          userEmail: doc.data().userEmail || "No Email Provided",
          scanTime,
          exitTime,
          location: {
            latitude: doc.data().location?.latitude || "N/A",
            longitude: doc.data().location?.longitude || "N/A",
          },
          duration: `${durationMinutes} mins`,
          exitLocation: doc.data().exitLocation || null,
          isSessionActive: doc.data().isSessionActive || false,
        };
      });

      // Auto-logout stale sessions
      await autoLogoutStaleSessions(visitsData);

      const validVisits = visitsData.filter((visit) => visit.userName && visit.userEmail);

      validVisits.sort((a, b) => b.scanTime - a.scanTime);

      let totalDuration = 0;
      validVisits.forEach((visit) => {
        const durationMinutes = parseInt(visit.duration.replace(/\D/g, "")) || 0;
        totalDuration += durationMinutes;
      });

      setVisits(validVisits);
      setStatsData({
        totalDevices: new Set(validVisits.map((v) => v.userEmail)).size,
        totalVisits: validVisits.length,
        avgDuration: validVisits.length
          ? Math.round(totalDuration / validVisits.length) + " mins"
          : "0 mins",
        lastUpdate: new Date().toLocaleTimeString(),
      });

      if (validVisits.length > 0) {
        setExpandedEmail(validVisits[0].userEmail);
      }
    } catch (error) {
      console.error("Error fetching visits:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminEmail");
    navigate("/AdminLogin");
  };

  const toggleEmailGroup = (email) => {
    setExpandedEmail(expandedEmail === email ? null : email);
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => {
      const direction =
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc";
      return { key, direction };
    });
  };

  const sortedVisits = [...visits].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const key = sortConfig.key;
    const direction = sortConfig.direction === "asc" ? 1 : -1;

    const aValue = a[key] || "";
    const bValue = b[key] || "";

    if (typeof aValue === "string" && typeof bValue === "string") {
      return direction * aValue.localeCompare(bValue);
    }
    return direction * (aValue > bValue ? 1 : -1);
  });

  const groupedVisits = sortedVisits.reduce((acc, visit) => {
    const email = visit.userEmail;
    if (!acc[email]) {
      acc[email] = [];
    }
    acc[email].push(visit);
    return acc;
  }, {});

  const filteredGroups = Object.entries(groupedVisits).filter(([email]) =>
    email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-vh-100 bg-light">
      <div className="text-center my-4">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-outline-danger mt-3">
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="container-fluid px-4 py-4">
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h6>Total Users</h6>
                <h3>{statsData.totalDevices}</h3>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h6>Total Visits</h6>
                <h3>{statsData.totalVisits}</h3>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h6>Average Duration</h6>
                <h3>{statsData.avgDuration}</h3>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h6>Last Updated</h6>
                <h3>{statsData.lastUpdate}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-header">
            <div className="d-flex align-items-center">
              <input
                type="text"
                className="form-control"
                placeholder="Search by email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button onClick={fetchVisits} className="btn btn-secondary ms-2">
                <RefreshCw size={18} /> Refresh
              </button>
            </div>
          </div>

          <div className="card-body">
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : (
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("userName")}>
                      User Name{" "}
                      {sortConfig.key === "userName" &&
                        (sortConfig.direction === "asc" ? "▲" : "▼")}
                    </th>
                    <th>User Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGroups.map(([email, userVisits]) => {
                    const latestVisit = userVisits[0];

                    return (
                      <React.Fragment key={email}>
                        <tr>
                          <td>
                            <button
                              className="btn btn-link"
                              onClick={() => toggleEmailGroup(email)}
                            >
                              {latestVisit.userName}
                              <ChevronDown
                                size={18}
                                className={`ms-2 ${
                                  expandedEmail === email ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          </td>
                          <td>
                            {expandedEmail === email ? (
                              <table className="table mb-0">
                                <thead>
                                  <tr>
                                    <th>User Name</th>
                                    <th>Email</th>
                                    <th>Scan Time</th>
                                    <th>Duration</th>
                                    <th>Entry Location</th>
                                    <th>Exit Time</th>
                                    <th>Exit Location</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {userVisits.map((visit) => (
                                    <tr key={visit.id}>
                                      <td>{visit.userName}</td>
                                      <td>{visit.userEmail}</td>
                                      <td>{visit.scanTime.toLocaleString()}</td>
                                      <td>{visit.duration}</td>
                                      <td>
                                        {visit.location.latitude},{" "}
                                        {visit.location.longitude}
                                      </td>
                                      <td>{visit.exitTime?.toLocaleString() || "Active"}</td>
                                      <td>
                                        {visit.exitLocation
                                          ? `${visit.exitLocation.latitude}, ${visit.exitLocation.longitude}`
                                          : "Active"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div>
                                <strong>Latest Visit:</strong>{" "}
                                {latestVisit.scanTime.toLocaleString()} -{" "}
                                {latestVisit.duration}
                              </div>
                            )}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
