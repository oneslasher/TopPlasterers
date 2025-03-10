const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Serve static files from the project directory
app.use(express.static(path.join(__dirname)));

// Serve static files from the images directory
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint to handle login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Simple authentication logic (for demonstration purposes only)
    if (username === 'Kevin' && password === 'T0pp145ta') {
        // In a real application, you would generate a session or token here
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
});

// Endpoint to handle image uploads
app.post('/upload', upload.single('image'), (req, res) => {
    const file = req.file;
    const description = req.body.description;

    // Save image metadata to a JSON file (for simplicity)
    const imageData = {
        src: file.filename,
        description: description
    };

    let data = [];
    try {
        data = JSON.parse(fs.readFileSync('images.json', 'utf8'));
    } catch (error) {
        console.error('Error reading images.json:', error);
    }

    data.push(imageData);
    fs.writeFileSync('images.json', JSON.stringify(data, null, 2));

    res.json(imageData);
});

// Endpoint to get all images
app.get('/images', (req, res) => {
    let data = [];
    try {
        data = JSON.parse(fs.readFileSync('images.json', 'utf8'));
    } catch (error) {
        console.error('Error reading images.json:', error);
    }
    res.json(data);
});

// Endpoint to delete an image
app.delete('/images/:filename', (req, res) => {
    const filename = req.params.filename;

    // Delete the image file
    fs.unlink(path.join(__dirname, 'images', filename), (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete image file' });
        }

        // Remove the image metadata from the JSON file
        let data = [];
        try {
            data = JSON.parse(fs.readFileSync('images.json', 'utf8'));
        } catch (error) {
            console.error('Error reading images.json:', error);
        }

        data = data.filter(image => image.src !== filename);
        fs.writeFileSync('images.json', JSON.stringify(data, null, 2));

        res.json({ message: 'Image deleted successfully' });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});