import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Navbar, EventCard, UserHeader } from './Components';

function Wishlist({ user }) {
  const navigate = useNavigate();
  const [wishlistEvents, setWishlistEvents] = useState([]);

  useEffect(() => {
    fetchWishlistEvents();
  }, []);

  const fetchWishlistEvents = async () => {
    try {
      const response = await axios.get('/api/wishlist');
      setWishlistEvents(response.data);
    } catch (error) {
      console.error('Error fetching wishlist events:', error);
    }
  };

  const handleRemoveFromWishlist = async (eventId) => {
    try {
      await axios.delete(`/api/wishlist/${eventId}`);
      fetchWishlistEvents();
    } catch (error) {
      console.error('Error removing event from wishlist:', error);
    }
  };

  const handleEventClick = (eventId) => navigate(`/event/${eventId}`);

  const handleUserClick = () => navigate('/user');

  return (
    <div>
      <UserHeader user={user} handleUserClick={handleUserClick} />
      <h1>Your Wishlist</h1>
      {wishlistEvents.length === 0 ? (
        <p>Your wishlist is empty</p>
      ) : (
        <ul className="wishlist-list">
          {wishlistEvents.map((event) => (
		<EventCard
		    event={event}
		    user={user}
		    handleEventClick={handleEventClick}
		    handleAddToWishlist={handleRemoveFromWishlist}
		/>
          ))}
        </ul>
      )}
	<Navbar navigate={navigate} currentPage="wishlist"/>
    </div>
  );
}

export default Wishlist;
