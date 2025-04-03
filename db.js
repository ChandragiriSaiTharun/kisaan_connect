const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const app = express();

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('kisaan_connect'));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',         // MySQL server host (usually localhost)
    user: 'projectk',      // Your MySQL username
    password: 'Kisaan@2025', // Your MySQL password
    database: 'kisaan'     // The database you want to connect to
});

// Connect to MySQL and create table if it doesn’t exist
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');

    // Create the farmers table
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS farmers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(100) NOT NULL,
            phone_number VARCHAR(15) NOT NULL,
            email VARCHAR(100),
            password VARCHAR(255) NOT NULL,
            state VARCHAR(50),
            district VARCHAR(50),
            village_town VARCHAR(100) NOT NULL,
            pin_code VARCHAR(10) NOT NULL,
            profile_picture VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.query(createTableQuery, (err, result) => {
        if (err) {
            console.error('Error creating table:', err);
            return;
        }
        console.log('Farmers table created or already exists');
    });
});

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: './kisaan_connect/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Serve the HTML form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'kisaan_connect', 'registration.html'));
});

// Handle form submission
app.post('/register', upload.single('profilePicture'), async (req, res) => {
    const {
        fullName, phoneNumber, email, password, confirmPassword,
        inputState, inputDistrict, village, pinCode
    } = req.body;

    if (password !== confirmPassword) {
        return res.send('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profilePicture = req.file ? `/kisaan_connect/${req.file.filename}` : null;

    const query = `
        INSERT INTO farmers (full_name, phone_number, email, password, state, district, village_town, pin_code, profile_picture)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        fullName, phoneNumber, email || null, hashedPassword,
        inputState, inputDistrict, village, pinCode, profilePicture
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.send('Error saving data');
        }
        res.send('Farmer registered successfully!');
    });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});