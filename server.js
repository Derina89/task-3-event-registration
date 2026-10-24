const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Location of our JSON data file
const dataFile = path.join(__dirname, "data", "registrations.json");

// Make sure the JSON file exists
function ensureDataFile() {
    const dataFolder = path.dirname(dataFile);

    if (!fs.existsSync(dataFolder)) {
        fs.mkdirSync(dataFolder, { recursive: true });
    }

    if (!fs.existsSync(dataFile)) {
        fs.writeFileSync(dataFile, "[]");
    }
}

// Read registrations from JSON file
function readRegistrations() {
    ensureDataFile();

    const data = fs.readFileSync(dataFile, "utf8");

    return JSON.parse(data);
}

// Save registrations to JSON file
function saveRegistrations(registrations) {
    fs.writeFileSync(
        dataFile,
        JSON.stringify(registrations, null, 2)
    );
}

// GET all registrations
app.get("/api/registrations", (req, res) => {
    try {
        const registrations = readRegistrations();

        res.json({
            success: true,
            registrations: registrations
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to read registrations."
        });
    }
});

// POST a new registration
app.post("/api/register", (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            event
        } = req.body;

        // Server-side validation
        if (!name || !email || !phone || !event) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields."
            });
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        const phonePattern = /^[0-9]{10}$/;

        if (!phonePattern.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Phone number must contain exactly 10 digits."
            });
        }

        if (name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Name must contain at least 2 characters."
            });
        }

        // Read existing registrations
        const registrations = readRegistrations();

        // Create new registration
        const newRegistration = {
            id: Date.now(),
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            event: event.trim(),
            createdAt: new Date().toISOString()
        };

        // Add registration
        registrations.push(newRegistration);

        // Save to JSON
        saveRegistrations(registrations);

        res.status(201).json({
            success: true,
            message: "Registration successful!",
            registration: newRegistration
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Something went wrong while registering."
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});