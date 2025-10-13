
// Contact.js
import React from 'react';
import './Contact.css';

const Contact = () => {
  return (
    
    <div className="contact-container">
      <h1>Let's Talk!</h1>
      <p>
        We’re thrilled to connect with you! Whether you have a question, need assistance, or want to discuss a potential project, we’re here to listen and help. At Mentor Token, we believe in the power of collaboration and are committed to providing you with the best support and solutions. Fill out the form below, and one of our team members will get back to you as soon as possible.
      </p>
      <p><strong>Let’s create something amazing together!</strong></p>
      <form>
        <input type="text" placeholder="Full Name" className="form-input" id='form-input1'/>
        <input type="email" placeholder="Email address" className="form-input" id='form-input2' />
        <textarea placeholder="Your message" className="form-textarea"></textarea>
        <button type="submit" className="form-button">Submit</button>
      </form>
    </div>
   
  );
};

export default Contact;
  