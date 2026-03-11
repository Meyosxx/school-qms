import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl, uploadUrl } from '../api';
import './Kiosk.css';

function Kiosk() {
  const [services, setServices] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [selectedService, setSelectedService] = useState('');

  const [printedTicket, setPrintedTicket] = useState(null);
  
  // NEW: State to hold our dynamic settings
  const [settings, setSettings] = useState({
    primary_color: '#27ae60', // Default green
    secondary_color: '#2c3e50', // Default dark blue
    video_path: ''
  });

  useEffect(() => {
    // Fetch Services
    axios.get(apiUrl('/api/services'))
      .then(res => setServices(res.data))
      .catch(err => console.error(err));

    // NEW: Fetch Settings
    axios.get(apiUrl('/api/settings'))
      .then(res => {
        if (res.data) setSettings(res.data);
      })
      .catch(err => console.error(err));
  }, []);

 const handleGetTicket = async (e) => {
    e.preventDefault();
    if (!selectedService) return alert("Please select a service");

    try {
      const res = await axios.post(apiUrl('/api/tickets'), { 
        studentName, serviceType: selectedService 
      });
      
      // 1. Save the ticket details for the receipt
      setPrintedTicket({
        ticketNumber: res.data.ticketNumber,
        name: studentName,
        service: selectedService,
        date: new Date().toLocaleString()
      });

      // 2. Clear the form for the next student
      setStudentName('');
      setSelectedService('');

      // 3. Wait a tiny fraction of a second for React to render the receipt, then print!
      setTimeout(() => {
        window.print();
      }, 500);

    } catch (err) {
      console.error(err);
    }
  };

return (
    <>
      {/* 1. ENTIRE SCREEN WRAPPER WITH DOTTED BACKGROUND */}
      <div className="kiosk-container">
        <div className="kiosk-bg"></div>
        <div className="kiosk-overlay"></div>
        
        {/* 2. HEADER (Transparent, just text floating at the top) */}
        <div className="kiosk-header">
          <h1 className="kiosk-header-title">
            Transaction Queuing Management System
          </h1>
        </div>

       {/* 3. MAIN CONTENT (Left Card & Right Video) */}
        <div className="kiosk-main">
          
          {/* LEFT HALF (35% Width) */}
          <div className="kiosk-left-pane">
            <div className="kiosk-form-card">
              <h1 className="kiosk-title">Welcome, Student!</h1>
              
              <form onSubmit={handleGetTicket} className="kiosk-form">
                <div className="kiosk-form-group">
                  <label>Full Name:</label>
                  <input
                    className="kiosk-input"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                
                <div className="kiosk-form-group">
                  <label>Select Service:</label>
                  <select
                    className="kiosk-input"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    required
                  >
                    <option value="">-- Choose a Department --</option>
                    {services.map(s => <option key={s.id} value={s.service_name}>{s.service_name}</option>)}
                  </select>
                </div>

                <button type="submit" className="kiosk-btn" style={{ backgroundColor: settings.primary_color }}>
                  PRINT TICKET
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT HALF (65% Width) */}
          <div className="kiosk-right-pane">
            <div className="video-wrapper">
              <video key={settings.video_path} autoPlay muted loop playsInline className="video-player">
                <source 
                  src={settings.video_path ? uploadUrl(settings.video_path) : `${process.env.PUBLIC_URL}/ELECTRON.mp4`} 
                  type="video/mp4" 
                />
              </video>
            </div>
          </div>

        </div>
      </div>
      
      {/* --- HIDDEN PRINT RECEIPT --- */}
      {printedTicket && (
        <div className="receipt-container">
          {settings.logo_path && (
            <img 
              src={uploadUrl(settings.logo_path)} 
              alt="Logo" 
              style={{ maxWidth: '100px', marginBottom: '10px', filter: 'grayscale(100%)' }} 
            />
          )}
          <div className="receipt-header">QUEUE SYSTEM</div>
          <div className="receipt-details"><strong>Name:</strong> {printedTicket.name}</div>
          <div className="receipt-details"><strong>Dept:</strong> {printedTicket.service}</div>
          <div className="receipt-ticket-number">{printedTicket.ticketNumber}</div>
          <div className="receipt-details" style={{ textAlign: 'center', fontSize: '0.9rem' }}>{printedTicket.date}</div>
          <div className="receipt-footer">Please wait for your number to be called.<br/>Thank you!</div>
        </div>
      )}
    </>
  );
}

export default Kiosk;
