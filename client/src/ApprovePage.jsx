import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ApprovePage.css';

const ApprovePage = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);

    useEffect(() => {
	fetchRequests();
    }, []);

    const fetchRequests = () => {
	axios.get('/api/admin/requests')
	    .then(response => {
		setRequests(response.data.requests);
	    })
	    .catch(error => {
		console.error('Error fetching requests:', error);
	    });
    };

    const approveCollege = (collegeId) => {
	axios.post('/api/admin/approve', { id: collegeId })
	    .then(response => {
		// Update the requests list after successful approval
		setRequests(requests.filter(request => request.id !== collegeId));
	    })
	    .catch(error => {
		console.error('Error approving college:', error);
	    });
    };

    const rejectCollege = (collegeId) => {
	axios.post('/api/admin/reject', { id: collegeId })
	    .then(response => {
		// Update the requests list after successful approval
		setRequests(requests.filter(request => request.id !== collegeId));
	    })
	    .catch(error => {
		console.error('Error approving college:', error);
	    });
    };

    
    const handleBack = () => navigate('/');

    return (
	<div>
	    <a class="title" href="" onClick={handleBack}>
		<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
		    <path d="M16.3125 28.95L6.4125 19.05C6.2625 18.9 6.156 18.7375 6.093 18.5625C6.03 18.3875 5.999 18.2 6 18C6 17.8 6.0315 17.6125 6.0945 17.4375C6.1575 17.2625 6.2635 17.1 6.4125 16.95L16.3125 7.05003C16.5875 6.77503 16.9315 6.63153 17.3445 6.61953C17.7575 6.60753 18.1135 6.75103 18.4125 7.05003C18.7125 7.32503 18.869 7.66903 18.882 8.08203C18.895 8.49503 18.751 8.85103 18.45 9.15003L11.1 16.5H27.8625C28.2875 16.5 28.644 16.644 28.932 16.932C29.22 17.22 29.3635 17.576 29.3625 18C29.3625 18.425 29.219 18.7815 28.932 19.0695C28.645 19.3575 28.2885 19.501 27.8625 19.5H11.1L18.45 26.85C18.725 27.125 18.869 27.475 18.882 27.9C18.895 28.325 18.751 28.675 18.45 28.95C18.175 29.25 17.825 29.4 17.4 29.4C16.975 29.4 16.6125 29.25 16.3125 28.95Z" fill="#F1EEFF"/>
		</svg>
		<h1>College Approval Requests</h1>
	    </a>
	    <ul className="signup-requests">
		{requests.map(request => (
		    <li key={request.id}>
			<h3 className="collegename">{request.collegeName}</h3>
			<div className="username">{request.username}</div>
			<div>
			    <button onClick={() => approveCollege(request.id)}>Approve</button>
			    <button onClick={() => rejectCollege(request.id)}>Reject</button>
			</div>
		    </li>
		))}
	    </ul>
	</div>
    );
};

export default ApprovePage;
