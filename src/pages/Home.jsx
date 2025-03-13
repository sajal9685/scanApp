import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "./Home.css";

const AUTO_LOGOUT_HOURS = 8; // Automatically log out after 8 hours

const formatDateTime = (date) => {
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

const fetchLocationFromAPI = async () => {
  try {
    const response = await axios.get("https://api.ipgeolocation.io/ipgeo", {
      params: { apiKey: "fb8d7499d1e04891a1f797815bd4c5b1" },
    });
    const { latitude, longitude } = response.data;
    return { latitude, longitude };
  } catch (error) {
    console.error("Error fetching location from API:", error);
    return { latitude: null, longitude: null };
  }
};

const Home = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [recentUserName, setRecentUserName] = useState("");
  const [recentUserEmail, setRecentUserEmail] = useState("");
  const [scanTime, setScanTime] = useState("");
  const [exitTime, setExitTime] = useState("");
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [status, setStatus] = useState("");
  const [duration, setDuration] = useState("");
  const [visitId, setVisitId] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [token, setToken] = useState("");

  const calculateDuration = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const duration = Math.abs(now - start);
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const hasExceededAutoLogoutLimit = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const duration = Math.abs(now - start);
    return duration >= AUTO_LOGOUT_HOURS * 60 * 60 * 1000;
  };

  const autoLogoutCheck = async () => {
    if (!isSessionActive || !scanTime) return;

    if (hasExceededAutoLogoutLimit(scanTime)) {
      console.log("Auto-logging out due to timeout.");
      await logExit();
    }
  };

  useEffect(() => {
    const interval = setInterval(autoLogoutCheck, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(interval); // Cleanup
  }, [isSessionActive, scanTime]);

  const fetchActiveSession = async (email) => {
    try {
      const userVisitsRef = collection(db, "visits");
      const activeSessionQuery = query(
        userVisitsRef,
        where("userEmail", "==", email),
        where("isSessionActive", "==", true)
      );
      const querySnapshot = await getDocs(activeSessionQuery);

      if (!querySnapshot.empty) {
        const activeSession = querySnapshot.docs[0];
        const sessionData = activeSession.data();
        setVisitId(activeSession.id);
        setScanTime(sessionData.scanTime);
        setToken(sessionData.token);
        setLocation(sessionData.location);
        setIsSessionActive(true);
        setDuration(calculateDuration(sessionData.scanTime));

        // Save active session to local storage for consistency
        localStorage.setItem(
          "activeSession",
          JSON.stringify({
            visitId: activeSession.id,
            scanTime: sessionData.scanTime,
            location: sessionData.location,
            token: sessionData.token,
            isSessionActive: true,
          })
        );

        setStatus("Resumed active session from Firestore.");
      } else {
        setStatus("No active session found.");
      }
    } catch (error) {
      console.error("Error fetching active session:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        await fetchUserDetails(user);
        await fetchActiveSession(user.email); // Fetch session across devices
      } else {
        setIsLoggedIn(false);
        navigate("/UserRegister");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUserDetails = async (user) => {
    try {
      const userDocRef = doc(db, "users", user.email.toLowerCase());
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setRecentUserName(userData.name || "Unknown User");
        setRecentUserEmail(userData.email || "Unknown Email");
      } else {
        console.log("No user data found in Firestore.");
      }
    } catch (error) {
      console.error("Error fetching user data from Firestore:", error);
    }
  };

  const startNewSession = async () => {
    if (isSessionActive) {
      setStatus("A session is already active.");
      return;
    }

    const now = new Date();
    const formattedTime = formatDateTime(now);
    setScanTime(formattedTime);

    const userLocation = await fetchLocationFromAPI();
    if (!userLocation.latitude || !userLocation.longitude) {
      setStatus("Unable to fetch location.");
      return;
    }

    setLocation(userLocation);
    const newToken = uuidv4();
    setToken(newToken);

    try {
      // End any existing active sessions
      const userVisitsRef = collection(db, "visits");
      const activeSessionQuery = query(
        userVisitsRef,
        where("userEmail", "==", recentUserEmail),
        where("isSessionActive", "==", true)
      );
      const querySnapshot = await getDocs(activeSessionQuery);
      querySnapshot.forEach(async (docSnapshot) => {
        await updateDoc(doc(db, "visits", docSnapshot.id), {
          isSessionActive: false,
          exitTime: formattedTime,
        });
      });

      // Start new session
      const visitData = {
        scanTime: formattedTime,
        location: userLocation,
        userName: recentUserName,
        userEmail: recentUserEmail,
        token: newToken,
        isSessionActive: true,
      };

      const docRef = await addDoc(userVisitsRef, visitData);
      setVisitId(docRef.id);
      setIsSessionActive(true);

      localStorage.setItem(
        "activeSession",
        JSON.stringify({
          visitId: docRef.id,
          scanTime: formattedTime,
          location: userLocation,
          token: newToken,
          isSessionActive: true,
        })
      );

      setStatus("Session started successfully!");
    } catch (error) {
      console.error("Error starting session:", error);
      setStatus("Error starting session.");
    }
  };

  const logExit = async () => {
    if (!isSessionActive) {
      setStatus("No active session to exit.");
      return;
    }

    const now = new Date();
    const formattedTime = formatDateTime(now);
    setExitTime(formattedTime);

    try {
      const exitLocation = await fetchLocationFromAPI();
      const sessionDuration = calculateDuration(scanTime);

      const exitData = {
        exitTime: formattedTime,
        isSessionActive: false,
        exitLocation: exitLocation,
        duration: sessionDuration,
      };

      await updateDoc(doc(db, "visits", visitId), exitData);

      setStatus("Session ended successfully!");
      resetSession();
    } catch (error) {
      console.error("Error recording exit:", error);
      setStatus("Error recording exit.");
    }
  };

  const resetSession = () => {
    setScanTime("");
    setExitTime("");
    setLocation({ latitude: null, longitude: null });
    setDuration("");
    setVisitId("");
    setIsSessionActive(false);
    setToken("");
    localStorage.removeItem("activeSession");
  };

  return (
    <div className="container my-4">
      <h1 className="text-center mb-4">Visit Logger</h1>
      <div className="mb-3">
        <strong>Most Recent User:</strong> {recentUserName}
      </div>
      <div className="mb-3">
        <strong>Email:</strong> {recentUserEmail}
      </div>
      <div className="mb-3">
        <strong>Scan Time:</strong> {scanTime || "Not started yet"}
      </div>
      <div className="mb-3">
        <strong>Exit Time:</strong> {exitTime || "Not recorded yet"}
      </div>
      <div className="mb-3">
        <strong>Duration:</strong> {duration || "Calculating..."}
      </div>
      <div className="mb-3">
        <strong>Location:</strong>{" "}
        {location.latitude && location.longitude
          ? `${location.latitude}, ${location.longitude}`
          : "Fetching..."}
      </div>
      <div className="mb-3">
        <strong>Status:</strong> {status}
      </div>

      {!isSessionActive ? (
        <button className="btn btn-success w-100" onClick={startNewSession}>
          Start Session
        </button>
      ) : (
        <button className="btn btn-danger w-100" onClick={logExit}>
          Log Exit
        </button>
      )}
    </div>
  );
};

export default Home;
