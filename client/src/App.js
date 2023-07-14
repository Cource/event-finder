import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import Signup from './Signup';
import Events from './Events';
import Wishlist from './Wishlist';
import EventPage from './EventPage';
import UserPage from './User';
import AddEvent from './AddEvent';
import ApprovePage from './ApprovePage';
import Home from './Home';

import './App.css';

function App() {
    const [user, setUser] = useState();
    
    useEffect(() => {
	// Fetch user from localStorage on component mount
	const storedUser = localStorage.getItem('user');
	if (storedUser) {
	    setUser(JSON.parse(storedUser));
	}
    }, []);
    
    const handleLogout = async () => {
	try {
	    localStorage.removeItem('user');
	    await axios.post('/api/logout');
	    setUser(null);
	} catch (error) {
	    console.error('Error logging out:', error);
	}
    };

  return (
    <Router>
      <div>
        {user ? (
          <Routes>
              <Route path="/" element={<Events user={user} />} />
	      <Route path="/user" element={<UserPage user={user} handleLogout={handleLogout} />} />
	      <Route path="/wishlist" element={<Wishlist user={user} />} />
	      {user.userType == 'college' && <Route path="/addevent" element={<AddEvent user={user}/>} />}
	      {user.userType == 'admin' && <Route path="/approve" element={<ApprovePage user={user}/>} />}
          </Routes>
        ) : (
          <Routes>
            <Route path="/signup" element={<Signup setUser={setUser} />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/" element={<Home />} />
          </Routes>
        )}
	  <Routes>
	      <Route path="/event/:id" element={<EventPage />} />
	  </Routes>
      </div>
    </Router>
  );
}

export default App;
