import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';

import './AddEvent.css';

const AddEvent = ({ user }) => {
  const [name, setName] = useState('');
  const collegeName = user.collegeName;
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('12:00');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [ticketRate, setTicketRate] = useState('');
  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const newEvent = {
        name,
        collegeName,
        date,
        time,
        latitude,
        longitude,
        tags,
        description,
        registrationLink,
        previewImage,
        ticketRate,
      };

      const response = await axios.post('/api/events', newEvent);
	navigate('/');
      console.log('Event added successfully:', response.data);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleMapClick = (e) => {
    const clickedCoordinate = toLonLat(e.coordinate);
    setLongitude(clickedCoordinate[0]);
    setLatitude(clickedCoordinate[1]);
  };

  const handleBack = () => navigate(-1);

  useEffect(() => {
    const map = new Map({
      target: 'map-container',
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([0, 0]), // Initial center position
        zoom: 2, // Initial zoom level
      }),
    });

    map.on('click', handleMapClick);

    return () => {
      map.un('click', handleMapClick);
    };
  }, []);

  return (
    <div className="add-event-container">
	<a class="title" href="" onClick={handleBack}>
	    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M16.3125 28.95L6.4125 19.05C6.2625 18.9 6.156 18.7375 6.093 18.5625C6.03 18.3875 5.999 18.2 6 18C6 17.8 6.0315 17.6125 6.0945 17.4375C6.1575 17.2625 6.2635 17.1 6.4125 16.95L16.3125 7.05003C16.5875 6.77503 16.9315 6.63153 17.3445 6.61953C17.7575 6.60753 18.1135 6.75103 18.4125 7.05003C18.7125 7.32503 18.869 7.66903 18.882 8.08203C18.895 8.49503 18.751 8.85103 18.45 9.15003L11.1 16.5H27.8625C28.2875 16.5 28.644 16.644 28.932 16.932C29.22 17.22 29.3635 17.576 29.3625 18C29.3625 18.425 29.219 18.7815 28.932 19.0695C28.645 19.3575 28.2885 19.501 27.8625 19.5H11.1L18.45 26.85C18.725 27.125 18.869 27.475 18.882 27.9C18.895 28.325 18.751 28.675 18.45 28.95C18.175 29.25 17.825 29.4 17.4 29.4C16.975 29.4 16.6125 29.25 16.3125 28.95Z" fill="#F1EEFF"/>
	    </svg>
	    <h2>Add Event</h2>
	</a>
      <form onSubmit={handleFormSubmit} className="add-event-form">
        <div className="form-row">
          <label>
            Event Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Date:
            <DatePicker
              selected={date}
              onChange={(date) => setDate(date)}
              dateFormat="dd/MM/yyyy"
            />
          </label>
          <label>
            Time:
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Latitude: {latitude}
          </label>
          <label>
              Longitude: {longitude} <br/>
	      (check the bottom of the page for the map)
          </label>
        </div>
        <div className="form-row">
          <label>
            Tags:
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </label>
          <label>
            Ticket Rate:
            <input
              type="text"
              value={ticketRate}
              placeholder="in ₹"
              onChange={(e) => setTicketRate(e.target.value)}
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Description:
            <textarea
              value={description}
              placeholder="About your event, list of programs, etc."
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </label>
        </div>
        <div className="form-row">
          <label>
            Registration Link:
            <input
              type="text"
              value={registrationLink}
              placeholder="Link to your website or registration form"
              onChange={(e) => setRegistrationLink(e.target.value)}
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Preview Image:
            <input
              type="text"
              value={previewImage}
              placeholder="Use a service like imgur.com to upload images"
              onChange={(e) => setPreviewImage(e.target.value)}
            />
          </label>
        </div>
        <button type="submit">Add Event</button>
      </form>
      <div id="map-container" className="map-container"></div>
    </div>
  );
};

export default AddEvent;
