import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./Mentor";  // Optional: You can add styles here

const Mentor_page = () => {
  const navigate = useNavigate();

  return (
    <div className="mentor-page">
        <img src='vector.png'></img>
      <h3>Mentor Page</h3>
      

      {/* Add more sections */}
      <div className="mentor-section">
        
        <ul>
          <li><a href="/mentorDashboard">Dashbord</a></li>
          <li><a href="/mentorstats">My stats</a></li>
          <li><a href="/mentorjob">Job feed</a></li>
        </ul>
      </div>
     <div className='assignedjobs'>
        <h2>Assigned Jobs</h2>

     </div>

     <div className='PendingJobs'>
        <h2>Pending Jobs</h2>
        <p>Jobs offered from your startup</p>
     </div>


     <div className='ApplicationSent'>
        <h2>Application sent</h2>
        <p>Jobs you have applied to</p>
     </div>

      {/* Example of a button that navigates to another page */}
      <button className="btn-back" onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
};

export default Mentor_page;
