import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import './Login.css';

function Login({ setUser }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);  
    const navigate = useNavigate();

    const handleLogin = async (e) => {
	e.preventDefault();
	try {
	    const response = await axios.post('/api/login', { username, password });
	    setUser(response.data);
	    localStorage.setItem('user', JSON.stringify(response.data));
	    setUsername('');
	    setPassword('');
	    navigate('/'); // Navigate to the events page
	} catch (error) {
	    setError(true);
	    console.error('Error logging in:', error);
	}
    };

    return (
	<div class="login">
	    <h2>Login</h2>
	    <p>Login to UniPulse for browsing Events</p>
	    <form onSubmit={handleLogin}>
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
		<button className="login-button" type="submit">Login</button>
	    </form>
	    {error ? <div>Could not Login</div> : <></>}
	    <a href="" onClick={() => navigate('/signup')} >Sign Up</a>
	</div>
    );
}

export default Login;
