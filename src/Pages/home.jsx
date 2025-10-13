
import React from 'react';
import './home.css'

const Home = () => {
  return (
    <div>
      <div className='prvdiv'>
       
       
            
       <img src='hero.png' alt='slika scene2' className='slika11'></img>
       <button class="get-started1"> → </button>
       <button class="get-in-touch1"> i </button>
   
       </div>
       <div className='vtordiv'>
          <img src='logos1.png' alt='slika1'></img>
          <img src='logos.png' alt='slika2' ></img>
          
       </div>
       <div className='tretdiv'>
           <p>More than 25+ Startups around the <br></br> world trusted Mentor Token.</p>
       </div>
       <div className='cetvrtidiv'>
        <img src='Vectary texture.png' alt='rocket' className='rocket'></img>
          <h3>FEATURES</h3>
          <h1>Boost Your Startup's Journey:<br></br> Discover Mentor Token's Robust<br></br> Features</h1>
          <div className='card1'>
            <img src='Vector12.png' alt='slika12'></img>
            <h2>Goal Setting</h2>
            <p>Set clear and achievable goals for your startup's success.</p>
          </div>
          <div className='card2'>
            <img src='Vector13.png' alt='slika13'></img>
            <h2>Performance Tracking</h2>
            <p>Monitor mentor performance in real-time and track progress.</p>
          </div>
          <div className='card3'>
            <img src='Vector14.png' alt='slika14'></img>
            <h2>RewordSystem</h2>
            <p>Motivate mentors with a secure and rewarding token-based reward system.</p>
          </div>
          <div className='card4'>
            <img src='Vector15.png' alt='slika15'></img>
            <h2>Knowledge Library</h2>
            <p>Access a comprehensive knowledge library to equip mentors with the skills, and motivation</p>
          </div>
      </div> 
      <div className='petidiv'>
        <h1>Every <span id='blue'> success</span>  is rewarded!
        </h1>
      </div>



      <div className='sestitidiv'>
        <div className='sestitidiv1'>
         <img src='Group 1000002313.png' alt='slika' className='prvalikaa'></img>
        </div>

        <div className='sestitidiv2'>
           <img src="Mentorshome.png" alt="Mentor Token" />
           <img className='sll' src='icon.png' alt='slika'></img>
           {/*<span className='eden'>Mentor Token </span>*/}
           
        </div>
        
      <div className='sestitidiv4'>
        {/*<img src='icon1.png' alt='slika'></img>*/}
        {/*<input type='text' placeholder='Search mentor..'></input>*/}

      </div>


        <div className='sestitidiv5'>
           {/*
           <button className='kopce1'>+ Add new Mentor</button>
           <button className='kopce2'>Create New Job</button>
           */}
        </div>

        
      </div>
    </div>
  );
};

export default Home;
  