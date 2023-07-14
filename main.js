const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const saltRounds = 10;

// Create SQLite database
const db = new sqlite3.Database('events.db');

db.serialize(() => {
  // Create users table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    userType TEXT,
    collegeName TEXT
  )`);

  // Create events table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    collegeName TEXT,
    date TEXT,
    time TEXT,
    latitude REAL,
    longitude REAL,
    tags TEXT,
    description TEXT,
    registrationLink TEXT,
    previewImage TEXT,
    ticketRate REAL,
    userId INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`);

  // Create wishlist table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS wishlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId INTEGER,
    userId INTEGER,
    FOREIGN KEY (eventId) REFERENCES events(id),
    FOREIGN KEY (userId) REFERENCES users(id)
  )`);

  // Create college signups table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS college_signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    collegeName TEXT,
    email TEXT
  )`);

});

// Middleware
app.use(express.json());
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    store: new FileStore({path: './sessions/'}),
    cookie: {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      path: '/',
      // Additional cookie settings...
    }
}));

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (req.session && req.session.user) {
	next();
    } else {
	res.status(401).json({ message: 'Unauthorized' });
    }
};

// User Sign Up
app.post('/api/signup', (req, res) => {
    const { username, password, collegeName } = req.body;
    const query = 'INSERT INTO users (username, password, userType, collegeName) VALUES (?, ?, ?, ?)';
    
    bcrypt.genSalt(saltRounds, (err, salt) => {
	if (err) {
	    console.error('Error generating salt:', err);
	    res.status(500).send('Internal Server Error');
	    return;
	}

	bcrypt.hash(password, salt, (err, hash) => {
	    if (err) {
		console.error('Error hashing password:', err);
		res.status(500).json({ message: 'Internal Server Error' });
		return;
	    }
	    
	    db.run(query, [username, hash, "student", collegeName], function (err) {
		if (err) {
		    console.error('Error creating user:', err);
		    res.status(500).json({ message: 'Internal Server Error' });
		    return;
		}
		
		req.session.user = { id: this.lastID, username, userType: "student", collegeName };
		res.status(201).json({ id: this.lastID, username, userType: "student", collegeName });
	    });
	});
    });
});

// College Sign Up
app.post('/api/college/signup', (req, res) => {
    const { username, password, collegeName, email } = req.body;

    bcrypt.genSalt(saltRounds, (err, salt) => {
	if (err) {
	    console.error('Error generating salt:', err);
	    res.status(500).send('Internal Server Error');
	    return;
	}

	bcrypt.hash(password, salt, (err, hash) => {
	    if (err) {
		console.error('Error hashing password:', err);
		res.status(500).json({ message: 'Internal Server Error' });
		return;
	    }
	    const insertQuery = 'INSERT INTO college_signups (username, password, collegeName, email) VALUES (?, ?, ?, ?)';
	    const params = [username, hash, collegeName, email];

	    db.run(insertQuery, params, function (err) {
		if (err) {
		    console.error('Error creating college sign-up request:', err);
		    res.status(500).json({ message: 'Internal Server Error' });
		    return;
		}
		
		res.status(201).json({ id: this.lastID, username, collegeName, email });
	    });
	});
    });
});

// Admin Approve College Sign Up Request
app.post('/api/admin/approve', requireAuth, (req, res) => {
    const { userType } = req.session.user;
    if (userType !== 'admin') {
	res.status(401).json({ message: 'Unauthorized' });
	return;
    }

    const { id } = req.body;

    const selectQuery = 'SELECT * FROM college_signups WHERE id = ?';
    db.get(selectQuery, [id], (err, row) => {
	if (err) {
	    console.error('Error retrieving college sign-up request:', err);
	    res.status(500).json({ message: 'Internal Server Error' });
	    return;
	}

	if (!row) {
	    res.status(404).json({ message: 'College sign-up request not found' });
	    return;
	}

	const { username, password, collegeName } = row;
	const insertQuery = 'INSERT INTO users (username, password, userType, collegeName) VALUES (?, ?, ?, ?)';
	const params = [username, password, 'college', collegeName];

	db.run(insertQuery, params, function (err) {
	    if (err) {
		console.error('Error adding college user:', err);
		res.status(500).json({ message: 'Internal Server Error' });
		return;
	    }

	    const deleteQuery = 'DELETE FROM college_signups WHERE id = ?';
	    db.run(deleteQuery, [id], function (err) {
		if (err) {
		    console.error('Error deleting college sign-up request:', err);
		    res.status(500).json({ message: 'Internal Server Error' });
		    return;
		}

		res.status(201).json({ message: 'College user approved and added successfully' });
	    });
	});
    });
});

// Admin Approve College Sign Up Request
app.post('/api/admin/reject', requireAuth, (req, res) => {
    const { userType } = req.session.user;
    if (userType !== 'admin') {
	res.status(401).json({ message: 'Unauthorized' });
	return;
    }

    const { id } = req.body;

    const selectQuery = 'SELECT * FROM college_signups WHERE id = ?';
    db.get(selectQuery, [id], (err, row) => {
	if (err) {
	    console.error('Error retrieving college sign-up request:', err);
	    res.status(500).json({ message: 'Internal Server Error' });
	    return;
	}

	if (!row) {
	    res.status(404).json({ message: 'College sign-up request not found' });
	    return;
	}

	const deleteQuery = 'DELETE FROM college_signups WHERE id = ?';
	db.run(deleteQuery, [id], function (err) {
	    if (err) {
		console.error('Error deleting college sign-up request:', err);
		res.status(500).json({ message: 'Internal Server Error' });
		return;
	    }

	    res.status(201).json({ message: 'College sign up rejected' });
	});
    });
});

// List Available College Sign-Up Requests
app.get('/api/admin/requests', requireAuth, (req, res) => {
    const { userType } = req.session.user;
    if (userType !== 'admin') {
	res.status(401).json({ message: 'Unauthorized' });
	return;
    }

    const selectQuery = 'SELECT * FROM college_signups';

    db.all(selectQuery, (err, rows) => {
	if (err) {
	    console.error('Error retrieving college sign-up requests:', err);
	    res.status(500).json({ message: 'Internal Server Error' });
	    return;
	}

	res.json({ requests: rows });
    });
});


// User Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ?';

    db.get(query, [username], (err, row) => {
	if (err) {
	    console.error('Error retrieving user:', err);
	    res.status(500).json({ message: 'Internal Server Error' });
	    return;
	}
	if (!row) {
	    res.status(404).json({ message: 'User not found' });
	    return;
	}

	bcrypt.compare(password, row.password, (err, result) => {
	    if (err) {
		console.error('Error comparing passwords:', err);
		res.status(500).json({ message: 'Internal Server Error' });
		return;
	    }

	    if (result) {
		const { id, username, userType, collegeName } = row;
		req.session.user = { id, username, userType, collegeName };
		res.json({ id, username, userType, collegeName });
	    } else {
		res.status(401).json({ message: 'Authentication failed' });
	    }
	});
    });
});

// User Logout
app.post('/api/logout', requireAuth, (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logout successful' });
});

// Add event to the events table (only accessible to college type users)
app.post('/api/events', requireAuth, (req, res) => {
    const { userType, collegeName } = req.session.user;
    if (userType !== 'college') {
	res.status(401).json({ message: 'Unauthorized' });
	return;
    }

    const { name, date, time, latitude, longitude, tags, description, registrationLink, previewImage, ticketRate } = req.body;
    const { id: userId } = req.session.user;

    if (!name || !date || !time || !latitude || !longitude || !tags || !description || !registrationLink || !previewImage || !ticketRate) {
	res.status(400).json({ message: 'Missing required fields' });
	return;
    }

    const query = 'INSERT INTO events (name, collegeName, date, time, latitude, longitude, tags, description, registrationLink, previewImage, ticketRate, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const params = [name, collegeName, date, time, latitude, longitude, tags, description, registrationLink, previewImage, ticketRate, userId];

    db.run(query, params, function (err) {
	if (err) {
	    console.error('Error adding event:', err);
	    res.status(500).json({ message: 'Internal Server Error' });
	    return;
	}

	res.status(201).json({ id: this.lastID });
    });
});

// Get all events
app.get('/api/events', (req, res) => {
    const { userType, collegeName } = req.session.user;
    let query = 'SELECT id, name, collegeName, date, tags, previewImage FROM events';
    let params = [];

    if (userType === 'college') {
	query += ' WHERE collegeName = ?';
	params.push(collegeName);
    }

    db.all(query, params, (err, rows) => {
	if (err) {
	    console.error('Error retrieving events:', err);
	    res.status(500).json({ message: 'Internal Server Error' });
	    return;
	}

	res.json(rows);
    });
});

app.get('/api/event/:id', (req, res) => {
    const eventId = req.params.id;

    // Retrieve the event information from the database
    const getEventQuery = 'SELECT * FROM events WHERE id = ?';
    db.get(getEventQuery, [eventId], (err, row) => {
	if (err) {
	    console.error(err);
	    res.status(500).send('Internal Server Error');
	} else if (!row) {
	    res.status(404).send('Event not found');
	} else {
	    const event = {
		id: row.id,
		name: row.name,
		date: row.date,
		time: row.time,
		description: row.description,
		collegeName: row.collegeName,
		lattitude: row.latitude,
		longitude: row.longitude,
		tags: row.tags,
		registrationLink: row.registrationLink,
		previewImage: row.previewImage,
		ticketRate: row.ticketRate,
	    };
	    res.json(event);
	}
    });
});


// Search events by name, collegeName, and tags
app.get('/api/search', (req, res) => {
    const { query: searchQuery } = req.query;

    const query = `SELECT id, name, collegeName, date, time, latitude, longitude, tags, description, registrationLink, previewImage, ticketRate FROM events WHERE (LOWER(name) LIKE '%' || LOWER(?) || '%' OR LOWER(collegeName) LIKE '%' || LOWER(?) || '%' OR LOWER(tags) LIKE '%' || LOWER(?) || '%')`;
    const params = [searchQuery, searchQuery, searchQuery];

    db.all(query, params, (err, rows) => {
	if (err) {
	    console.error('Error searching events:', err);
	    res.status(500).json({ message: 'Internal Server Error' });
	    return;
	}

	res.json(rows);
    });
});

// Add event to wishlist
app.post('/api/wishlist', requireAuth, (req, res) => {
    const { eventId } = req.body;
    const { id: userId } = req.session.user;

    if (!eventId) {
	res.status(400).json({ message: 'Missing required field' });
	return;
    }

    const query = 'INSERT INTO wishlist (eventId, userId) VALUES (?, ?)';
    const params = [eventId, userId];
    db.all('select * from wishlist where eventId = ? and userId = ?', params, (err, rows) => {
	if (rows != []) {
	    db.run(query, params, function (err) {
		if (err) {
		    console.error('Error adding event to wishlist:', err);
		    res.status(500).json({ message: 'Internal Server Error' });
		    return;
		}

		res.status(201).json({ id: this.lastID });
	    });
	}
    })
});

// Remove event from wishlist
app.delete('/api/wishlist/:id', requireAuth, (req, res) => {
    const { id: eventId } = req.params;
    const { id: userId } = req.session.user;

    const query = 'DELETE FROM wishlist WHERE eventId = ? AND userId = ?';
    const params = [eventId, userId];

    db.run(query, params, function (err) {
	if (err) {
	    console.error('Error removing event from wishlist:', err);
	    res.status(500).json({ message: 'Internal Server Error' });
	    return;
	}

	res.json({ message: 'Event removed from wishlist' });
    });
});

// Get user's wishlist
app.get('/api/wishlist', requireAuth, (req, res) => {
    const { id: userId } = req.session.user;

    const query = `SELECT events.id, events.name, events.collegeName, events.date, events.time, events.latitude, events.longitude, events.tags, events.description, events.registrationLink, events.previewImage, events.ticketRate
    FROM wishlist
    INNER JOIN events ON wishlist.eventId = events.id
    WHERE wishlist.userId = ?`;
    const params = [userId];

    db.all(query, params, (err, rows) => {
	if (err) {
	    console.error('Error retrieving wishlist:', err);
	    res.status(500).json({ message: 'Internal Server Error' });
	    return;
	}

	res.json(rows);
    });
});

// Check if event is wishlisted
app.get('/api/isWishlisted', requireAuth, (req, res) => {
  const { eventId } = req.query;
  const { id: userId } = req.session.user;

  if (!eventId) {
    res.status(400).json({ message: 'Missing required field' });
    return;
  }

  const query = 'SELECT COUNT(*) as count FROM wishlist WHERE eventId = ? AND userId = ?';
  const params = [eventId, userId];

  db.get(query, params, (err, row) => {
    if (err) {
      console.error('Error checking wishlist:', err);
      res.status(500).json({ message: 'Internal Server Error' });
      return;
    }

    const isWishlisted = row.count > 0;
    res.json({ isWishlisted });
  });
});


// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'client/build')));

// Catch-all route to serve the index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});


// Start the server
const port = process.env.PORT || 8000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
