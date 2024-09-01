import React, { useState, useEffect } from 'react';
import userData from '../assets/users.json'; // Adjust path as needed
import '../styles/SignUpLogin.css';

const SignUpLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('patient');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState({ patients: [], doctors: [] });

  useEffect(() => {
    // Set the state with imported JSON data
    setUsers({
      patients: userData.patients,
      doctors: userData.doctors
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const currentUsers = userType === 'patient' ? users.patients : users.doctors;
      const userExists = currentUsers.find(u => u.username === username && u.password === password);

      if (userExists) {
        if (userType === 'patient') {
          window.location.href = '/patient-dashboard';
        } else {
          window.location.href = '/doctor-dashboard';
        }
      } else {
        setError('Invalid username or password.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Error logging in:', error);
    }
  };

  return (
    
    <div className="signup-login-container">
      <form onSubmit={handleSubmit} className="signup-login-form">
        <h2>{userType === 'patient' ? 'Patient Login' : 'Doctor Login'}</h2>
        {error && <p className="error-message">{error}</p>}
        <label>
          Username:
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <label>
          I am a:
          <select value={userType} onChange={(e) => setUserType(e.target.value)} required>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
        </label>
        <button type="submit">Log In</button>
        <p>Don't have an account? <a href="#" onClick={() => setUserType(userType === 'patient' ? 'doctor' : 'patient')}>{userType === 'patient' ? 'Sign Up as Doctor' : 'Sign Up as Patient'}</a></p>
      </form>
    </div>
  );
};

export default SignUpLogin;
