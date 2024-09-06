import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import appointmentsData from '../assets/appointments.json'; // Adjust path as needed
import '../styles/DoctorDashboard.css';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointmentsForDate, setAppointmentsForDate] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [newAppointment, setNewAppointment] = useState({
    patientUsername: '',
    time: '',
    status: 'Scheduled',
    doctorName: '',
    clinicRoom: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('calendar');
  const [patientBills, setPatientBills] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [newBill, setNewBill] = useState({ patientUsername: '', amount: '' });
  const [newPrescription, setNewPrescription] = useState({ patientUsername: '', details: '' });
  const [selectedPatient, setSelectedPatient] = useState('');
  const [todoList, setTodoList] = useState([]);

  useEffect(() => {
    setAppointments(appointmentsData.appointments);
  }, []);

  useEffect(() => {
    updateAppointmentsForDate(selectedDate);
    updateTodoListForDate(selectedDate);
  }, [selectedDate, appointments, statusFilter]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const updateAppointmentsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    const filteredAppointments = appointments.filter(app =>
      app.time.startsWith(dateString) &&
      (statusFilter === '' || app.status === statusFilter)
    );
    setAppointmentsForDate(filteredAppointments);
  };

  const updateTodoListForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    const todos = appointments
      .filter(app => app.time.startsWith(dateString))
      .map(app => ({
        patientName: app.patientUsername,
        details: `Time: ${new Date(app.time).toLocaleTimeString()} - Status: ${app.status} - Doctor: ${app.doctorName} - Room: ${app.clinicRoom}`
      }));
    setTodoList(todos);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleInputChange = (e) => {
    setNewAppointment({
      ...newAppointment,
      [e.target.name]: e.target.value
    });
  };

  const isConflict = (appointment) => {
    return appointments.some(app =>
      app.time === appointment.time &&
      app.doctorName === appointment.doctorName &&
      app.status === 'Scheduled'
    );
  };

  const handleAddAppointment = () => {
    if (isConflict(newAppointment)) {
      setError('Conflict: An appointment with this time and doctor already exists.');
      return;
    }
    if (!newAppointment.patientUsername || !newAppointment.time || !newAppointment.doctorName || !newAppointment.clinicRoom) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setAppointments([...appointments, newAppointment]);
    setNewAppointment({ patientUsername: '', time: '', status: 'Scheduled', doctorName: '', clinicRoom: '' });
    updateAppointmentsForDate(selectedDate); 
    updateTodoListForDate(selectedDate); // Update To-Do List
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const exportToCSV = () => {
    const csvRows = [
      ['Patient Username', 'Date', 'Time', 'Status', 'Doctor Name', 'Clinic Room'],
      ...appointments.map(app => [
        app.patientUsername,
        new Date(app.time).toLocaleDateString(),
        new Date(app.time).toLocaleTimeString(),
        app.status,
        app.doctorName,
        app.clinicRoom
      ])
    ];

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'appointments.csv');
    link.click();
  };

  const searchResults = appointmentsForDate.filter(app =>
    app.patientUsername.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBill = () => {
    setPatientBills([...patientBills, newBill]);
    setNewBill({ patientUsername: '', amount: '' });
  };

  const handleAddPrescription = () => {
    setPrescriptions([...prescriptions, newPrescription]);
    setNewPrescription({ patientUsername: '', details: '' });
  };

  const handleBackToLogin = () => {
    window.location.href = '/'; // Replace with the path to your login page
  };

  const handlePrintDetails = () => {
    const billsForPatient = patientBills.filter(bill => bill.patientUsername === selectedPatient);
    const prescriptionsForPatient = prescriptions.filter(prescription => prescription.patientUsername === selectedPatient);

    let printContent = `<h1>Details for ${selectedPatient}</h1>`;
    printContent += `<h2>Bills:</h2><ul>${billsForPatient.map(bill => `<li><strong>Amount:</strong> ${bill.amount}</li>`).join('')}</ul>`;
    printContent += `<h2>Prescriptions:</h2><ul>${prescriptionsForPatient.map(prescription => `<li><strong>Details:</strong> ${prescription.details}</li>`).join('')}</ul>`;

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Print Details</title></head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="doctor-dashboard">
      <header className="nav-bar">
        <h1 className="title">Doctor Dashboard</h1>
        <nav className="nav-menu">
          <button onClick={() => setActiveSection('calendar')} className="nav-button">Calendar</button>
          <button onClick={() => setActiveSection('todo')} className="nav-button">To-Do List</button>
          <button onClick={() => setActiveSection('prescriptions')} className="nav-button">Prescriptions</button>
          <button onClick={() => setActiveSection('bills')} className="nav-button">Bills</button>
          <button onClick={() => setActiveSection('add-appointment')} className="nav-button">Add Appointment</button>
        </nav>
        <button onClick={handleBackToLogin} className="back-to-login-button">Back to Login</button>
      </header>

      {activeSection === 'calendar' && (
        <section className="calendar-section">
          <h2>Appointments for {selectedDate.toDateString()}</h2>
          <div className="cal">
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              tileClassName={({ date }) => {
                const dateString = date.toISOString().split('T')[0];
                const hasAppointment = appointments.some(app => app.time.startsWith(dateString));
                return hasAppointment ? 'highlight' : null;
              }}
              onClickDay={handleDateChange}
            />
          </div>
          <div className="filters">
            <select value={statusFilter} onChange={handleStatusChange} className="filter-select">
              <option value="">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by patient username"
              className="search-input"
            />
          </div>
          <ul className="appointment-list">
            {searchResults.length > 0 ? (
              searchResults.map((app, index) => (
                <li key={index} className="appointment-item">
                  <strong>Patient:</strong> {app.patientUsername} <br />
                  <strong>Time:</strong> {new Date(app.time).toLocaleTimeString()} <br />
                  <strong>Status:</strong> {app.status} <br />
                  <strong>Doctor:</strong> {app.doctorName} <br />
                  <strong>Room:</strong> {app.clinicRoom}
                </li>
              ))
            ) : (
              <li>No appointments found for this date.</li>
            )}
          </ul>
          <button onClick={exportToCSV} className="export-button">Export to CSV</button>
        </section>
      )}

      {activeSection === 'todo' && (
        <section className="todo-section">
          <h2>To-Do List</h2>
          <ul className="todo-list">
            {todoList.length > 0 ? (
              todoList.map((todo, index) => (
                <li key={index} className="todo-item">
                  <strong>Patient:</strong> {todo.patientName} <br />
                  <strong>Details:</strong> {todo.details} <br />
                </li>
              ))
            ) : (
              <li>No tasks for this date.</li>
            )}
          </ul>
          <hr />
        </section>
      )}

      {activeSection === 'add-appointment' && (
        <section className="add-appointment-section">
          <h2>Add Appointment</h2>
          <div className="form-group">
            <input
              type="text"
              name="patientUsername"
              value={newAppointment.patientUsername}
              onChange={handleInputChange}
              placeholder="Patient Username"
              className="form-input"
            />
            <input
              type="datetime-local"
              name="time"
              value={newAppointment.time}
              onChange={handleInputChange}
              className="form-input"
            />
            <input
              type="text"
              name="doctorName"
              value={newAppointment.doctorName}
              onChange={handleInputChange}
              placeholder="Doctor Name"
              className="form-input"
            />
            <input
              type="text"
              name="clinicRoom"
              value={newAppointment.clinicRoom}
              onChange={handleInputChange}
              placeholder="Clinic Room"
              className="form-input"
            />
          </div>
          <button onClick={handleAddAppointment} className="add-button">Add Appointment</button>
          {error && <p className="error-message">{error}</p>}
        </section>
      )}

      {activeSection === 'prescriptions' && (
        <section className="prescriptions-section">
          <h2>Prescriptions</h2>
          <div className="form-group">
            <input
              type="text"
              value={newPrescription.patientUsername}
              onChange={(e) => setNewPrescription({ ...newPrescription, patientUsername: e.target.value })}
              placeholder="Patient Username"
              className="form-input"
            />
            <textarea
              value={newPrescription.details}
              onChange={(e) => setNewPrescription({ ...newPrescription, details: e.target.value })}
              placeholder="Prescription Details"
              className="form-textarea"
            />
          </div>
          <button onClick={handleAddPrescription} className="add-button">Add Prescription</button>
        </section>
      )}

      {activeSection === 'bills' && (
        <section className="bills-section">
          <h2>Bills</h2>
          <div className="form-group">
            <input
              type="text"
              value={newBill.patientUsername}
              onChange={(e) => setNewBill({ ...newBill, patientUsername: e.target.value })}
              placeholder="Patient Username"
              className="form-input"
            />
            <input
              type="number"
              value={newBill.amount}
              onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
              placeholder="Amount"
              className="form-input"
            />
          </div>
          <button onClick={handleAddBill} className="add-button">Add Bill</button>
          <div className="patient-select">
            <label htmlFor="patient-select">Select Patient:</label>
            <select
              id="patient-select"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="form-select"
            >
              <option value="">Select Patient</option>
              {[...new Set(patientBills.map(bill => bill.patientUsername))].map(username => (
                <option key={username} value={username}>{username}</option>
              ))}
            </select>
          </div>
          {selectedPatient && (
            <>
              <button onClick={handlePrintDetails} className="print-button">Print Details</button>
              <div className="bills-list">
                <h3>Bills:</h3>
                <ul>
                  {patientBills.filter(bill => bill.patientUsername === selectedPatient).map((bill, index) => (
                    <li key={index}>
                      <strong>Amount:</strong> {bill.amount}
                    </li>
                  ))}
                </ul>
                <h3>Prescriptions:</h3>
                <ul>
                  {prescriptions.filter(prescription => prescription.patientUsername === selectedPatient).map((prescription, index) => (
                    <li key={index}>
                      <strong>Details:</strong> {prescription.details}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default DoctorDashboard;

