import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Mentor = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '', // Add confirmPassword to the state
    phone: '',
    skils: '',
    desc: '',
    acceptedjobs: ''
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Destructure the form data, including confirmPassword
    const { name, email, password, confirmPassword, phone, skils, desc, acceptedjobs } = formData;

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Send the form data to the backend
    axios.post('http://127.0.0.1:3001/mentor', { name, email, password, phone, skils, desc, acceptedjobs })
      .then(result => {
        setSuccess(true);
        setError(null);
        // Redirect to login after successful signup
        navigate('/login');
      })
      .catch(err => {
        if (err.response && err.response.data.message) {
          setError(err.response.data.message);  // Show server error message
        } else {
          setError('Signup failed. Please try again.');
        }
        console.log(err);
      });
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card shadow-lg" style={{ width: '28rem' }}>
        <div className="card-header text-center">
          <h3>Sign Up</h3>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">Signup successful! Redirecting to login...</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="phone">Phone</label>
              <input
                type="text"
                className="form-control"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="skils">Skills</label>
              <input
                type="text"
                className="form-control"
                id="skils"
                name="skils"
                value={formData.skils}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="desc">Description</label>
              <input
                type="text"
                className="form-control"
                id="desc"
                name="desc"
                value={formData.desc}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="acceptedjobs">Accepted Jobs</label>
              <input
                type="text"
                className="form-control"
                id="acceptedjobs"
                name="acceptedjobs"
                value={formData.acceptedjobs}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Mentor;
