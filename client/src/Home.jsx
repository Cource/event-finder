import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

function HomePage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [collegeName, setCollegeName] = useState('');
    const [email, setEmail] = useState('');

    const handleLogin = () => {
	navigate('/login');
    };

    const handleCollegeReq = async (e) => {
	e.preventDefault();
	const response = await axios.post('/api/college/signup', { username, password, collegeName, email });
	setUsername('');
	setPassword('');
	setCollegeName('');
	setEmail('');
	if(response.status == 200) alert("request sent");
    }

    return (
	<div>
	    <section className="hero">
		<div className="hero-content">
		    <nav><h1>UniPulse</h1></nav>
		    <div>
			<h1>Discover and Register for Events Across Kerala</h1>
			<p>Explore exciting events happening in colleges across Kerala and sign up now!</p>
		    </div>
		    <button className="login-button" onClick={handleLogin}>Login to browse events</button>
		</div>
	    </section>

	    <section className="college-signup">
		<h2>College Sign-up Request</h2>
		<p>Are you a representative for a college? Sign up your college to our service here.</p>
		<form onSubmit={handleCollegeReq}>
		    <label htmlFor="userName">Username:</label>
		    <input
			type="text"
			id="userName"
			name="userName"
			onChange={(e) => setUsername(e.target.value)}
			required
		    />
		    <label htmlFor="collegeName">College Name:</label>
		    <input
			type="text"
			id="collegeName"
			name="collegeName"
			onChange={(e) => setCollegeName(e.target.value)}
			required
		    />
		    <label htmlFor="email">Email:</label>
		    <input
			type="email"
			id="email"
			name="email"
			onChange={(e) => setEmail(e.target.value)}
			required
		    />
		    <label htmlFor="password">Password:</label>
		    <input
			type="password"
			id="password"
			name="password"
			onChange={(e) => setPassword(e.target.value)}
			required
		    />
		    <button type="submit">Submit</button>
		</form>
	    </section>

	    {/* Additional content for the home page */}
	</div>
    );
}

export default HomePage;
