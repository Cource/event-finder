import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Navbar, EventCard, UserHeader } from './Components';

import './Events.css';

function Events({ user }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState('');

  useEffect(() => {
      fetchEvents();
  }, []);

  useEffect(() => {
    getUserLocation();
  }, [events]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const getUserLocation = async () => {
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const { display_name } = response.data;
      setUserLocation(display_name);

      sortEventsByProximity(latitude, longitude);
    } catch (error) {
      console.error('Error getting user location:', error);
    }
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      } else {
        reject(new Error('Geolocation is not supported by this browser.'));
      }
    });
  };

  const sortEventsByProximity = (latitude, longitude) => {
    const sortedEvents = events.sort((a, b) => {
      const distanceA = calculateDistance(a.latitude, a.longitude, latitude, longitude);
      const distanceB = calculateDistance(b.latitude, b.longitude, latitude, longitude);
      return distanceA - distanceB;
    });
    setEvents(sortedEvents);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`/api/search?query=${searchQuery}`);
      setEvents(response.data);
      setSearchQuery('');
    } catch (error) {
      console.error('Error searching events:', error);
    }
  };

  const handleAddToWishlist = async (eventId) => {
    try {
      await axios.post('/api/wishlist', { eventId });
      fetchEvents();
    } catch (error) {
      console.error('Error adding event to wishlist:', error);
    }
  };

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const handleUserClick = () => navigate('/user');

  return (
    <div>
      <UserHeader user={user} handleUserClick={handleUserClick} />
      <form onSubmit={handleSearch} className="search">
        <input
          type="text"
          placeholder="Search for events near you"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="search-button" type="submit">
          <svg
            width="22"
            height="18"
            viewBox="0 0 22 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.0375 17.7625L12.1375 12.8625C11.7 13.2125 11.1969 13.4896 10.6281 13.6937C10.0594 13.8979 9.45417 14 8.8125 14C7.22292 14 5.87775 13.4496 4.777 12.3489C3.67567 11.2475 3.125 9.90208 3.125 8.3125C3.125 6.72292 3.67567 5.37746 4.777 4.27613C5.87775 3.17538 7.22292 2.625 8.8125 2.625C10.4021 2.625 11.7475 3.17538 12.8489 4.27613C13.9496 5.37746 14.5 6.72292 14.5 8.3125C14.5 8.95417 14.3979 9.55937 14.1937 10.1281C13.9896 10.6969 13.7125 11.2 13.3625 11.6375L18.2844 16.5594C18.4448 16.7198 18.525 16.9167 18.525 17.15C18.525 17.3833 18.4375 17.5875 18.2625 17.7625C18.1021 17.9229 17.8979 18.0031 17.65 18.0031C17.4021 18.0031 17.1979 17.9229 17.0375 17.7625ZM8.8125 12.25C9.90625 12.25 10.8361 11.8673 11.602 11.102C12.3673 10.3361 12.75 9.40625 12.75 8.3125C12.75 7.21875 12.3673 6.28892 11.602 5.523C10.8361 4.75767 9.90625 4.375 8.8125 4.375C7.71875 4.375 6.78892 4.75767 6.023 5.523C5.25767 6.28892 4.875 7.21875 4.875 8.3125C4.875 9.40625 5.25767 10.3361 6.023 11.102C6.78892 11.8673 7.71875 12.25 8.8125 12.25Z"
              fill="#F1EEFF"
            />
          </svg>
        </button>
      </form>


      <div className="event-heading">
        <h1>Events</h1>
        {user.userType === 'college' && (
          <button onClick={() => navigate('/addevent')}>+ Add Event</button>
        )}
      </div>
      <ul className="events-list">
        {events.map((event) => (
          <EventCard
            event={event}
            user={user}
            handleEventClick={handleEventClick}
            handleAddToWishlist={handleAddToWishlist}
          />
        ))}
      </ul>
	<div className="user-location">Your Location: {userLocation}</div>
      <Navbar navigate={navigate} currentPage="home" />
    </div>
  );
}

export default Events;
