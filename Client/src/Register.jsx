import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const apiBase = import.meta.env.VITE_API_URL;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post(`${apiBase}/auth/register`, { username, password });
      const token = res.data.token;
      
      // Save token and set default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className='d-flex align-items-center flex-column mt-3'>
      <h2>Register</h2>
      <form className='wt-50' onSubmit={handleRegister}>
        <div className='mb-3 mt-3'>
          <label className='form-label'>Username</label>
          <input 
            type='text' 
            className='form-control' 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        <div className='mb-3'>
          <label className='form-label'>Password</label>
          <input 
            type='password' 
            className='form-control' 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        {error && <div className='alert alert-danger'>{error}</div>}
        <div className='d-flex align-items-center justify-content-between w-100'>
          <button type='submit' className='btn btn-primary'>Register</button>
          <Link to='/login' className='ms-3'>Login</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
