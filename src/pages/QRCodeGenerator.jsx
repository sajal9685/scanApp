import React, { useState } from 'react';
import { collection, addDoc } from "firebase/firestore";
import { db } from '../firebaseConfig'; // Import your Firestore instance from FirebaseConfig.js


const QRCodeGenerator = () => {
  const [url] = useState('https://scan-app-5d29a.web.app/');
  const [isSaving, setIsSaving] = useState(false);
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

  const saveToDatabase = async () => {
    setIsSaving(true);
    try {
      const docRef = await addDoc(collection(db, "qrcodes"), {
        url,
        timestamp: new Date().toISOString(),
        qrApiUrl,
      });
      alert(`QR Code saved with ID: ${docRef.id}`);
    } catch (error) {
      console.error('Error saving QR Code to database:', error);
      alert('Failed to save QR code. Please check your database configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadQRCode = async () => {
    try {
      const response = await fetch(qrApiUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = 'prototype-qrcode.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadLink.href);

      // Save QR Code metadata to Firestore
      await saveToDatabase();
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Failed to download QR code. Please try again.');
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '20px auto',
      padding: '20px',
      textAlign: 'center',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      backgroundColor: 'white'
    }}>
      <h1 style={{
        marginBottom: '20px',
        color: '#333',
        fontSize: '24px'
      }}>
        Register Your Acoount
      </h1>
      
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 0 5px rgba(0,0,0,0.05)'
      }}>
        <img 
          src={qrApiUrl}
          alt="Prototype QR Code"
          style={{
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
            margin: '0 auto'
          }}
        />
      </div>

      <button
        onClick={downloadQRCode}
        style={{
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          transition: 'background-color 0.3s',
          marginBottom: '15px'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : 'Download & Save QR Code'}
      </button>

      <p style={{ 
        color: '#666',
        fontSize: '14px',
        marginTop: '10px'
      }}>
        Scan this QR code with your phone 
      </p>
      
      <p style={{ 
        color: '#888',
        fontSize: '12px',
        marginTop: '20px'
      }}>
        URL: {url}
      </p>
    </div>
  );
};

export default QRCodeGenerator;
