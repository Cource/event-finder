import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

import './EventPage.css'

function EventPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
	fetchEvent();
    }, []);
    useEffect(() => {
	checkWishlistStatus();
    }, [event]);

    const fetchEvent = async () => {
	try {
	    const response = await axios.get(`/api/event/${id}`);
	    setEvent(response.data);
	} catch (error) {
	    console.error('Error fetching event:', error);
	}
    };

    // Function to fetch the wishlist status of the event
    const checkWishlistStatus = async () => {
	try {
            const response = await axios.get(`/api/isWishlisted?eventId=${id}`);
            setIsWishlisted(response.data.isWishlisted);
	} catch (error) {
            console.error('Error checking wishlist status:', error);
	}
    };

    const handleAddToWishlist = async () => {
	try {
	    if(!isWishlisted) 
		await axios.post('/api/wishlist', { eventId: id });
	    else
		await axios.delete(`/api/wishlist/${id}`);
	    setIsWishlisted(!isWishlisted);
	} catch (error) {
	    console.error('Error adding event to wishlist:', error);
	}
    };

    const handleBookTickets = () => {
	const registrationLink = event.registrationLink;
	if (registrationLink) {
	    window.open(registrationLink, '_blank');
	}
    };

    const handleShare = () => {
	if (navigator.share) {
	    navigator.share({
		title: 'Check out this event!',
		text: event.name,
		url: window.location.href
	    })
		.then(() => {
		    console.log('Shared successfully!');
		})
		.catch((error) => {
		    console.error('Error sharing:', error);
		});
	} else {
	    const tempInput = document.createElement('input');
	    tempInput.value = window.location.href;
	    document.body.appendChild(tempInput);
	    tempInput.select();
	    document.execCommand('copy');
	    document.body.removeChild(tempInput);
	    console.log('Link copied to clipboard!');
	}
    };

    const handleBack = () => {
	navigate('/');
    };

    if (!event) {
	return <p>Loading...</p>;
    }

    return (
	<div class="event-view">
	    <a class="title" href="" onClick={handleBack}>
		<div>
		    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M16.3125 28.95L6.4125 19.05C6.2625 18.9 6.156 18.7375 6.093 18.5625C6.03 18.3875 5.999 18.2 6 18C6 17.8 6.0315 17.6125 6.0945 17.4375C6.1575 17.2625 6.2635 17.1 6.4125 16.95L16.3125 7.05003C16.5875 6.77503 16.9315 6.63153 17.3445 6.61953C17.7575 6.60753 18.1135 6.75103 18.4125 7.05003C18.7125 7.32503 18.869 7.66903 18.882 8.08203C18.895 8.49503 18.751 8.85103 18.45 9.15003L11.1 16.5H27.8625C28.2875 16.5 28.644 16.644 28.932 16.932C29.22 17.22 29.3635 17.576 29.3625 18C29.3625 18.425 29.219 18.7815 28.932 19.0695C28.645 19.3575 28.2885 19.501 27.8625 19.5H11.1L18.45 26.85C18.725 27.125 18.869 27.475 18.882 27.9C18.895 28.325 18.751 28.675 18.45 28.95C18.175 29.25 17.825 29.4 17.4 29.4C16.975 29.4 16.6125 29.25 16.3125 28.95Z" fill="#F1EEFF"/>
		    </svg>
		    <h2>Event</h2>
		</div>
		<button onClick={handleShare}>
		    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M24 29.3334C22.8889 29.3334 21.9444 28.9445 21.1667 28.1667C20.3889 27.3889 20 26.4445 20 25.3334C20 25.1778 20.0111 25.0165 20.0333 24.8494C20.0556 24.6822 20.0889 24.5325 20.1333 24.4L10.7333 18.9334C10.3556 19.2667 9.93333 19.528 9.46667 19.7174C9 19.9067 8.51111 20.0009 8 20C6.88889 20 5.94444 19.6111 5.16667 18.8334C4.38889 18.0556 4 17.1111 4 16C4 14.8889 4.38889 13.9445 5.16667 13.1667C5.94444 12.3889 6.88889 12 8 12C8.51111 12 9 12.0947 9.46667 12.284C9.93333 12.4734 10.3556 12.7342 10.7333 13.0667L20.1333 7.60002C20.0889 7.46669 20.0556 7.31691 20.0333 7.15069C20.0111 6.98446 20 6.82313 20 6.66669C20 5.55558 20.3889 4.61113 21.1667 3.83335C21.9444 3.05558 22.8889 2.66669 24 2.66669C25.1111 2.66669 26.0556 3.05558 26.8333 3.83335C27.6111 4.61113 28 5.55558 28 6.66669C28 7.7778 27.6111 8.72224 26.8333 9.50002C26.0556 10.2778 25.1111 10.6667 24 10.6667C23.4889 10.6667 23 10.5725 22.5333 10.384C22.0667 10.1956 21.6444 9.93424 21.2667 9.60002L11.8667 15.0667C11.9111 15.2 11.9444 15.3502 11.9667 15.5174C11.9889 15.6845 12 15.8454 12 16C12 16.1556 11.9889 16.3169 11.9667 16.484C11.9444 16.6511 11.9111 16.8009 11.8667 16.9334L21.2667 22.4C21.6444 22.0667 22.0667 21.8058 22.5333 21.6174C23 21.4289 23.4889 21.3342 24 21.3334C25.1111 21.3334 26.0556 21.7222 26.8333 22.5C27.6111 23.2778 28 24.2222 28 25.3334C28 26.4445 27.6111 27.3889 26.8333 28.1667C26.0556 28.9445 25.1111 29.3334 24 29.3334Z" fill="#F1EEFF"/>
		    </svg>
		</button>
	    </a>
	    <div class="event-top">
		<img class="preview-image" src={event.previewImage} alt="Event Preview" />
		<button onClick={handleAddToWishlist}>
		    {isWishlisted ? <>Wishlisted</> : <>Add to Wishlist</> }
		    {isWishlisted ?
		     <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
			 <path d="M15 26.6875L13.1875 25.0375C6.75 19.2 2.5 15.3375 2.5 10.625C2.5 6.7625 5.525 3.75 9.375 3.75C11.55 3.75 13.6375 4.7625 15 6.35C16.3625 4.7625 18.45 3.75 20.625 3.75C24.475 3.75 27.5 6.7625 27.5 10.625C27.5 15.3375 23.25 19.2 16.8125 25.0375L15 26.6875Z" fill="#A56EDB"/>
		     </svg>
		     :
		     <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
			 <path d="M15.125 23.1875L15 23.3125L14.8625 23.1875C8.925 17.8 5 14.2375 5 10.625C5 8.125 6.875 6.25 9.375 6.25C11.3 6.25 13.175 7.5 13.8375 9.2H16.1625C16.825 7.5 18.7 6.25 20.625 6.25C23.125 6.25 25 8.125 25 10.625C25 14.2375 21.075 17.8 15.125 23.1875ZM20.625 3.75C18.45 3.75 16.3625 4.7625 15 6.35C13.6375 4.7625 11.55 3.75 9.375 3.75C5.525 3.75 2.5 6.7625 2.5 10.625C2.5 15.3375 6.75 19.2 13.1875 25.0375L15 26.6875L16.8125 25.0375C23.25 19.2 27.5 15.3375 27.5 10.625C27.5 6.7625 24.475 3.75 20.625 3.75Z" fill="#A56EDB"/>
		     </svg>
		    }
		</button>
	    </div>
	    <div class="event-details">
		<h1>{event.name}</h1>
		<div class="event-details-main">
		    <p><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			   <path d="M12 21L5 17.2V11.2L1 9L12 3L23 9V17H21V10.1L19 11.2V17.2L12 21ZM12 12.7L18.85 9L12 5.3L5.15 9L12 12.7ZM12 18.725L17 16.025V12.25L12 15L7 12.25V16.025L12 18.725Z" fill="#F1EEFF"/>
		       </svg>
			{event.collegeName}
		    </p>
		    <p><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			   <path d="M5 22C4.45 22 3.979 21.804 3.587 21.412C3.195 21.02 2.99933 20.5493 3 20V6C3 5.45 3.196 4.979 3.588 4.587C3.98 4.195 4.45067 3.99933 5 4H6V2H8V4H16V2H18V4H19C19.55 4 20.021 4.196 20.413 4.588C20.805 4.98 21.0007 5.45067 21 6V20C21 20.55 20.804 21.021 20.412 21.413C20.02 21.805 19.5493 22.0007 19 22H5ZM5 20H19V10H5V20Z" fill="#F1EEFF"/>
		       </svg>
			{event.date}
		    </p>
		    <p><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			   <path d="M13 12.175L15.25 14.425C15.4333 14.6083 15.525 14.8377 15.525 15.113C15.525 15.3883 15.4333 15.6257 15.25 15.825C15.05 16.025 14.8123 16.125 14.537 16.125C14.2617 16.125 14.0243 16.025 13.825 15.825L11.7 13.7C11.4667 13.4667 11.2917 13.2083 11.175 12.925C11.0583 12.6417 11 12.3333 11 12V9C11 8.71667 11.096 8.479 11.288 8.287C11.48 8.095 11.7173 7.99933 12 8C12.2833 8 12.521 8.096 12.713 8.288C12.905 8.48 13.0007 8.71733 13 9V12.175ZM12 4C12.2833 4 12.521 4.096 12.713 4.288C12.905 4.48 13.0007 4.71733 13 5C13 5.28333 12.904 5.521 12.712 5.713C12.52 5.905 12.2827 6.00067 12 6C11.7167 6 11.479 5.904 11.287 5.712C11.095 5.52 10.9993 5.28267 11 5C11 4.71667 11.096 4.479 11.288 4.287C11.48 4.095 11.7173 3.99933 12 4ZM20 12C20 12.2833 19.904 12.521 19.712 12.713C19.52 12.905 19.2827 13.0007 19 13C18.7167 13 18.479 12.904 18.287 12.712C18.095 12.52 17.9993 12.2827 18 12C18 11.7167 18.096 11.479 18.288 11.287C18.48 11.095 18.7173 10.9993 19 11C19.2833 11 19.521 11.096 19.713 11.288C19.905 11.48 20.0007 11.7173 20 12ZM12 18C12.2833 18 12.521 18.096 12.713 18.288C12.905 18.48 13.0007 18.7173 13 19C13 19.2833 12.904 19.521 12.712 19.713C12.52 19.905 12.2827 20.0007 12 20C11.7167 20 11.479 19.904 11.287 19.712C11.095 19.52 10.9993 19.2827 11 19C11 18.7167 11.096 18.479 11.288 18.287C11.48 18.095 11.7173 17.9993 12 18ZM6 12C6 12.2833 5.904 12.521 5.712 12.713C5.52 12.905 5.28267 13.0007 5 13C4.71667 13 4.479 12.904 4.287 12.712C4.095 12.52 3.99933 12.2827 4 12C4 11.7167 4.096 11.479 4.288 11.287C4.48 11.095 4.71733 10.9993 5 11C5.28333 11 5.521 11.096 5.713 11.288C5.905 11.48 6.00067 11.7173 6 12ZM12 22C10.6167 22 9.31667 21.7373 8.1 21.212C6.88333 20.6867 5.825 19.9743 4.925 19.075C4.025 18.175 3.31267 17.1167 2.788 15.9C2.26333 14.6833 2.00067 13.3833 2 12C2 10.6167 2.26267 9.31667 2.788 8.1C3.31333 6.88333 4.02567 5.825 4.925 4.925C5.825 4.025 6.88333 3.31267 8.1 2.788C9.31667 2.26333 10.6167 2.00067 12 2C13.3833 2 14.6833 2.26267 15.9 2.788C17.1167 3.31333 18.175 4.02567 19.075 4.925C19.975 5.825 20.6877 6.88333 21.213 8.1C21.7383 9.31667 22.0007 10.6167 22 12C22 13.3833 21.7373 14.6833 21.212 15.9C20.6867 17.1167 19.9743 18.175 19.075 19.075C18.175 19.975 17.1167 20.6877 15.9 21.213C14.6833 21.7383 13.3833 22.0007 12 22ZM12 20C14.2333 20 16.125 19.225 17.675 17.675C19.225 16.125 20 14.2333 20 12C20 9.76667 19.225 7.875 17.675 6.325C16.125 4.775 14.2333 4 12 4C9.76667 4 7.875 4.775 6.325 6.325C4.775 7.875 4 9.76667 4 12C4 14.2333 4.775 16.125 6.325 17.675C7.875 19.225 9.76667 20 12 20Z" fill="#F1EEFF"/>
		       </svg>
			{event.time}
		    </p>
		</div>
		<div class="tags">			
		    {event.tags.split(' ').map((tag, index) => (
			<span key={index} >
			    {tag}
			</span>
		    ))}
		</div>
		<div class="event-about">
		    <h2>About this event</h2>
		    <p>{event.description}</p>
		</div>
	    </div>
	    {event.ticketRate && (
		<button class="book-ticket" onClick={handleBookTickets}>Book Tickets Now <div class="price">₹{event.ticketRate}</div></button>
	    )}
	</div>
    );
}

export default EventPage;
