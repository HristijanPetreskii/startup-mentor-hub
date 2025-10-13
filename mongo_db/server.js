const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/semos_project', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Connection success message
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
});

// Routes will go here
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

const Mentor = require('./models/mentors');

// Create Mentor
app.post('/mentors', async (req, res) => {
    const mentor = new Mentor(req.body);
    try {
        await mentor.save();
        res.send(mentor);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Read Mentors (All)
app.get('/mentors', async (req, res) => {
    try {
        const mentors = await Mentor.find();
        res.send(mentors);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Read Mentor (One by ID)
app.get('/mentors/:id', async (req, res) => {
    try {
        const mentor = await Mentor.findById(req.params.id);
        res.send(mentor);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Update Mentor
app.put('/mentors/:id', async (req, res) => {
    try {
        const mentor = await Mentor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(mentor);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete Mentor
app.delete('/mentors/:id', async (req, res) => {
    try {
        const mentor = await Mentor.findByIdAndDelete(req.params.id);
        res.send(mentor);
    } catch (err) {
        res.status(500).send(err);
    }
});

//
const Job = require('./models/job');

// Create Mentor
app.post('/jobs', async (req, res) => {
    const job = new Mentor(req.body);
    try {
        await job.save();
        res.send(job);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Read Mentors (All)
app.get('/jobs', async (req, res) => {
    try {
        const jobs = await Mentor.find();
        res.send(jobs);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Read Mentor (One by ID)
app.get('/jobs/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        res.send(job);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Update Mentor
app.put('/jobs/:id', async (req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(job);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete Mentor
app.delete('/jobs/:id', async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        res.send(job);
    } catch (err) {
        res.status(500).send(err);
    }
});


// applocation

const Application = require('./models/application');

// Create Mentor
app.post('/applications', async (req, res) => {
    const application = new Application(req.body);
    try {
        await application.save();
        res.send(application);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Read Mentors (All)
app.get('/applications', async (req, res) => {
    try {
        const applications = await Application.find();
        res.send(application);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Read Mentor (One by ID)
app.get('/applications/:id', async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        res.send(application);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Update Mentor
app.put('/applications/:id', async (req, res) => {
    try {
        const application = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(application);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete 
app.delete('/applications/:id', async (req, res) => {
    try {
        const application = await Application.findByIdAndDelete(req.params.id);
        res.send(application);
    } catch (err) {
        res.status(500).send(err);
    }
});

//company

const Company = require('./models/company');

// Create
app.post('/companys', async (req, res) => {
    const company = new Company(req.body);
    try {
        await company.save();
        res.send(company);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Read  (All)
app.get('/companys', async (req, res) => {
    try {
        const companys = await Company.find();
        res.send(companys);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Read  (One by ID)
app.get('/companys/:id', async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        res.send(company);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Update 
app.put('/companys/:id', async (req, res) => {
    try {
        const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(company);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete 
app.delete('/companys/:id', async (req, res) => {
    try {
        const company = await Company.findByIdAndDelete(req.params.id);
        res.send(company);
    } catch (err) {
        res.status(500).send(err);
    }
});
