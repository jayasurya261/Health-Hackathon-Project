import React, { useState, useEffect } from 'react';
import doctorsData from '../assets/users.json'; // Replace with the correct path
import appointmentsData from '../assets/appointments.json'; // Replace with the correct path
import Papa from 'papaparse';
import '../styles/PatientDashboard.css'; // Ensure correct path

const PatientDashboard = () => {
  const [doctors, setDoctors] = useState(doctorsData.doctors);
  const [appointments, setAppointments] = useState(appointmentsData.appointments);
  const [bookings, setBookings] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedBooking, setSelectedBooking] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [conflictMessage, setConflictMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState('book');

  useEffect(() => {
    const patientAppointments = appointments.filter(app => app.patientUsername === 'currentPatient');
    setBookings(patientAppointments);
    setLoading(false);
  }, [appointments]);

  const updateAvailableTimes = (doctorUsername) => {
    const doctorAppointments = appointments.filter(app => app.doctorUsername === doctorUsername);
    const allTimes = [
      '2024-08-15T09:00:00',
      '2024-08-15T10:00:00',
      '2024-08-15T11:00:00',
      '2024-08-15T12:00:00'
    ];
    const bookedTimes = doctorAppointments.map(app => app.time);
    const availableTimes = allTimes.filter(time => !bookedTimes.includes(time));
    setAvailableTimes(availableTimes);
  };

  const handleDoctorChange = (e) => {
    const doctorUsername = e.target.value;
    setSelectedDoctor(doctorUsername);
    updateAvailableTimes(doctorUsername);
  };

  const handleBooking = (e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to book this appointment?')) {
      return;
    }

    const bookedTimes = appointments
      .filter(app => app.doctorUsername === selectedDoctor)
      .map(app => app.time);

    if (bookedTimes.includes(selectedTime)) {
      setConflictMessage('The selected time slot is already booked. Please choose another one.');
      return;
    }

    const newAppointment = {
      id: new Date().toISOString(),
      patientUsername: 'currentPatient',
      doctorUsername: selectedDoctor,
      time: selectedTime
    };
    const updatedAppointments = [...appointments, newAppointment];

    setAppointments(updatedAppointments);
    setBookings([...bookings, newAppointment]);
    setSuccess('Appointment booked successfully!');
    setConflictMessage('');
    setSelectedTime('');
    setSelectedDoctor('');

    updateAvailableTimes(selectedDoctor);

    // Clear success message after 5 seconds
    setTimeout(() => setSuccess(''), 5000);
  };

  const handleCancelBooking = () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    const updatedAppointments = appointments.filter(app => !(app.id === selectedBooking));
    setAppointments(updatedAppointments);
    setBookings(updatedAppointments.filter(app => app.patientUsername === 'currentPatient'));
    setSuccess('Booking cancelled successfully!');
    setSelectedBooking('');

    // Clear success message after 5 seconds
    setTimeout(() => setSuccess(''), 5000);
  };

  const exportToCSV = () => {
    try {
      const csv = Papa.unparse(bookings, { header: true });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'appointments.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setError('An error occurred while exporting to CSV.');
      console.error('Error exporting to CSV:', error);
    }
  };

  const handleBackToLogin = () => {
    window.location.href = '/'; // Replace with the path to your login page
  };

  const renderNav = () => (
    <header className="nav-barh">

    <nav className="patient-dashboard-nav">
      <img src="./src/assets/logo.png" alt="Lumos Maxima" className='logo'/>
      <button className={`nav-button ${currentSection === 'book' ? 'active' : ''}`} onClick={() => setCurrentSection('book')}>Book Appointment</button>
      <button className={`nav-button ${currentSection === 'cancel' ? 'active' : ''}`} onClick={() => setCurrentSection('cancel')}>Cancel Appointment</button>
      <button className={`nav-button ${currentSection === 'emergency' ? 'active' : ''}`} onClick={() => setCurrentSection('emergency')}>Emergency Contact</button>
    <button onClick={handleBackToLogin} className="back-to-login-buttonp">Back to Login</button>
    </nav>
    </header>
  );
  
  const renderSection = () => {
    switch (currentSection) {
      case 'book':
        return (

          <section className="appointment-section">
            <h2>Book an Appointment</h2>
            <form onSubmit={handleBooking} className="appointment-form">
              <label>
                Select Doctor:
                <select value={selectedDoctor} onChange={handleDoctorChange} required>
                  <option value="">-- Select a doctor --</option>
                  {doctors.map(doctor => (
                    <option key={doctor.username} value={doctor.username}>{doctor.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Select Time:
                <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} required>
                  <option value="">-- Select a time --</option>
                  {availableTimes.map(time => (
                    <option key={time} value={time}>{new Date(time).toLocaleTimeString()}</option>
                  ))}
                </select>
              </label>
              <button type="submit" className="submit-button">Book Appointment</button>
            </form>
          </section>
        );
      case 'cancel':
        return (
          <section className="cancel-section">
            <h2>Cancel an Appointment</h2>
            <label>
              Select Booking to Cancel:
              <select value={selectedBooking} onChange={(e) => setSelectedBooking(e.target.value)} required>
                <option value="">-- Select a booking --</option>
                {bookings.map(booking => (
                  <option key={booking.id} value={booking.id}>
                    {`Doctor: ${booking.doctorUsername}, Time: ${new Date(booking.time).toLocaleString()}`}
                  </option>
                ))}
              </select>
            </label>
            <button onClick={handleCancelBooking} disabled={!selectedBooking} className="submit-button">Cancel Booking</button>
          </section>
        );
      case 'emergency':
        return (
          <section className="emergency-section">
            <h2>Emergency Contact</h2>
            <p>If you have an emergency, please call 108 or visit the nearest hospital.</p>
            <button 
        className="emergency-button" 
        onClick={() => window.location.href = 'tel:108'}>
       sos
      </button>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="patient-dashboard">
  

      {loading && <p className="loading-message">Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      {conflictMessage && <p className="conflict-message">{conflictMessage}</p>}

      {renderNav()}
      {renderSection()}

      {currentSection === 'book' && (
        <section className="bookings-section">
          <h2>Your Bookings</h2>
          <button onClick={exportToCSV} className="export-button">Export Bookings to CSV</button>
          <ul>
            {bookings.length > 0 ? (
              bookings.map(booking => (
                <li key={booking.id}>
                  <strong>Patient:</strong> {booking.patientUsername} <br />
                  <strong>Doctor:</strong> {booking.doctorUsername} <br />
                  <strong>Time:</strong> {new Date(booking.time).toLocaleString()}
                </li>
              ))
            ) : (
              <p>No bookings found.</p>
            )}
          </ul>
        </section>
      )}
    </div>
  );
};

export default PatientDashboard;
