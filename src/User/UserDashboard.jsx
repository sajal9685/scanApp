import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { Clock, LogOut, MapPin, User, Calendar, Timer } from 'lucide-react';
import './Dashboard.css';

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [pastVisits, setPastVisits] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;

      if (user) {
        const userEmail = user.email.toLowerCase();

        try {
          const userDocRef = doc(db, 'users', userEmail);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            console.error('No user data found in Firestore.');
          }

          const activeSessionQuery = query(
            collection(db, 'visits'),
            where('userEmail', '==', userEmail),
            where('isSessionActive', '==', true)
          );
          const activeSessionSnap = await getDocs(activeSessionQuery);

          if (!activeSessionSnap.empty) {
            setActiveSession(activeSessionSnap.docs[0].data());
          } else {
            setActiveSession(null);
          }

          const pastVisitsQuery = query(
            collection(db, 'visits'),
            where('userEmail', '==', userEmail),
            where('isSessionActive', '==', false),
            orderBy('scanTime', 'desc')
          );
          const pastVisitsSnap = await getDocs(pastVisitsQuery);

          const pastVisitsData = pastVisitsSnap.docs.map((visitDoc) => {
            const data = visitDoc.data();
            return {
              id: visitDoc.id,
              scanTime: data.scanTime,
              exitTime: data.exitTime || 'N/A',
              duration: data.duration || 'N/A',
              location: data.location || { latitude: 'N/A', longitude: 'N/A' },
              exitLocation: data.exitLocation || { latitude: 'N/A', longitude: 'N/A' },
            };
          });

          setPastVisits(pastVisitsData);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/UserLogin');
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/UserLogin');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const formatDurationString = (durationString) => {
    if (!durationString || typeof durationString !== 'string') return 'N/A';
    const minutes = parseInt(durationString.split(' ')[0], 10);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="user-info">
          <div className="avatar">
            {userData?.name?.charAt(0) || 'U'}
          </div>
          <div className="user-details">
            <h1>Welcome, {userData?.name || 'User'}!</h1>
            <p><User size={16} /> {userData?.email || 'N/A'}</p>
          </div>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      {activeSession ? (
        <div className="active-session-card">
          <h2>Active Session</h2>
          <div className="session-details">
            <p><Clock size={16} /> Started: {activeSession.scanTime}</p>
            <p><MapPin size={16} /> Location: {`${activeSession.location.latitude}, ${activeSession.location.longitude}`}</p>
          </div>
        </div>
      ) : (
        <div className="no-active-session">
          <p>No active session found.</p>
        </div>
      )}

      <div className="recent-visits-section">
        <h2>Past Visits</h2>
        {pastVisits.length > 0 ? (
          <div className="visits-grid">
            {pastVisits.map((visit) => (
              <div key={visit.id} className="visit-card">
                <div className="visit-header">
                  <Calendar size={16} />
                  <span>{visit.scanTime}</span>
                </div>
                <div className="visit-details">
                  <p><Clock size={16} /> Exit: {visit.exitTime}</p>
                  <p><Timer size={16} /> Duration: {formatDurationString(visit.duration)}</p>
                  <p><MapPin size={16} /> Location: {`${visit.location.latitude}, ${visit.location.longitude}`}</p>
                  <p><MapPin size={16} /> Exit Location: {`${visit.exitLocation.latitude}, ${visit.exitLocation.longitude}`}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No past visits found.</p>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
