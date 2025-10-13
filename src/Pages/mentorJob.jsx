import React, { useEffect, useState } from 'react';
//import './mentorStats.css'
import axios from 'axios';
import './MentorJob.css'

const MentorJob = () => {
  const[users,setUsers] =useState([])
  useEffect(()=>{
         axios.get('http://localhost:3001/getjob')
         .then(users=>setUsers(users.data))
         .catch(err=>console.log(err))
  },[])

  

  return (
    <div className="job-container">
    {users.map(user => (
      <div key={user._id} className="job-card">
        <img src='metaLogo.png' width={"50px"} height={"50px"}></img>
        <h2>TechWave innovations</h2>
        <h3>{user.title}</h3>
        <p>{user.description}</p>
        <button className="view-more-btn">View More</button>
      </div>
    ))}
  </div>
  );
};

export default MentorJob;