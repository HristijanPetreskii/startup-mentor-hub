import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ✅ Import

const MentorList = () => {
    const [mentors, setMentors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate(); // ✅ Hook за навигација

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const response = await axios.get('http://localhost:3001/mentors');
                setMentors(response.data);
            } catch (error) {
                console.error('Error fetching mentors:', error);
            }
        };

        fetchMentors();
    }, []);

    const filteredMentors = mentors.filter(mentor =>
        mentor.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="mentor-list">
            <h2>Mentor List</h2>
            <p><strong>Total mentors: {mentors.length}</strong></p>

            <input
                type="text"
                placeholder="Search mentors by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-bar"
            />

            <div className="mentor-cards">
                {filteredMentors.length > 0 ? (
                    filteredMentors.map((mentor) => (
                        <div key={mentor._id} className="mentor-card">
                            <h3>{mentor.name}</h3>
                            <p><strong>Email:</strong> {mentor.email}</p>
                            {mentor.phone && <p><strong>Phone:</strong> {mentor.phone}</p>}
                            {mentor.desc && <p><strong>Description:</strong> {mentor.desc}</p>}

                            {/* ✅ Додај Job Offer копче */}
                            <button 
                                onClick={() => navigate(`/job-offer/${mentor._id}`)} 
                                className="job-offer-button"
                            >
                                Job Offer
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No mentors found.</p>
                )}
            </div>
        </div>
    );
};

export default MentorList;
