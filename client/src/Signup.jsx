import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import './Login.css';

function Signup({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [error, setError] = useState(false);  
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/signup', { username, password, collegeName });
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setUsername('');
      setPassword('');
      setCollegeName('');
      navigate('/'); // Navigate to the events page

    } catch (error) {
      setError(true);
      console.error('Error signing up:', error);
    }
  };

  return (
      <div class="signup" >
	  <h2>Sign Up</h2>
	  <p>Create a Student account</p>
	  <form onSubmit={handleSignup}>
              <input
		  type="text"
		  placeholder="Username"
		  value={username}
		  onChange={(e) => setUsername(e.target.value)}
		  required
              />
              <input
		  type="password"
		  placeholder="Password"
		  value={password}
		  onChange={(e) => setPassword(e.target.value)}
		  required
              />
              <input
		  type="text"
		  placeholder="College Name"
		  value={collegeName}
		  onChange={(e) => setCollegeName(e.target.value)}
		  required
              />
              <button className="signup-button" type="submit">Signup</button>
	  </form>
	  {error ? <div>Could not create an account</div> : <></>}
	  <a href="" onClick={() => navigate('/login')} >Log In instead</a>
      </div>
  );
}

export default Signup;
