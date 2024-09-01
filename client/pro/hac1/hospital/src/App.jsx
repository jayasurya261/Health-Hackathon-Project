import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUpLogin from '../src/component/SignUpLogin';
import PatientDashboard from './component/PatientDashboard';
import DoctorDashboard from '../src/component/DoctorDashboard';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<SignUpLogin />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
