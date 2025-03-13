import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ShippingComponent = () => {
  const [shippingData, setShippingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Directly use the API key in the code (not secure for production)
    const apiKey = 'fKZiYsFmMbKLhpIHwQjbVATO4aZUvErzeVvR5nqXy5fGJQr2qzhpiiTtRcXsuPWj4mReMYHdJzoQ3ncBkqI7DJk4q2OtwCLwJGXsDLpVECMtIbqz8FmYxChnx7SYqjaZmkcHz6qOWi5bpvojWlaqQjlhzMLKkIe2CJ67uPVz4hCLBJajYLMD4OF76lfn0uC68wjgTEbU0qXFfDLsdNMriSPG6EaqKWlypV4AX7E6W2gGfEunLDxvJN06KqHYNI31'; // Replace with your actual API key
    const apiUrl = 'https://www.icarry.in/api_login';  // Replace with the actual iCarry API endpoint URL

    // Sample data for shipping request (adjust this based on iCarry API documentation)
    const shippingRequestData = {
      origin: 'Mumbai',
      destination: 'Delhi',
      weight: 2, // in kg
      dimensions: { length: 30, width: 20, height: 10 }, // cm
    };

    // API Request using Axios
    axios.post(apiUrl, shippingRequestData, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,  // Use the API key directly in the header
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        setShippingData(response.data);  // Store the API response data
        setLoading(false);  // Stop the loading state
      })
      .catch(err => {
        setError(err.message);  // Handle any errors
        setLoading(false);
      });
  }, []);

  // Handle different states (loading, error, data)
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Shipping Data</h1>
      <pre>{JSON.stringify(shippingData, null, 2)}</pre>
    </div>
  );
};

export default ShippingComponent;
