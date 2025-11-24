import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../service/api/api';
import { useAuth } from '../../service/auth/AuthContext';
import '../../assets/css/login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Don't submit if already loading
    if (loading) return;
    
    setLoading(true);

    try {
      const data = await AuthService.login(credentials);
      login(data.access, data.user);
      localStorage.setItem('refresh_token', data.refresh);
      
      // Redirect based on user role
      if (data.user.role === 'ADMIN') {
        navigate('/');  // Admin goes to home/dashboard
      } else if (data.user.role === 'STAFF' || data.user.role === 'RECEPTION') {
        navigate('/dropped-packages');  // Staff goes to dropped packages
      } else {
        navigate('/');  // Default fallback
      }
      
    } catch (err) {
      setError(err.message || 'Invalid username or password');
      // Clear inputs for security
      setCredentials({ username: '', password: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <i className="fas fa-lock"></i>
          </div>
          <h2>Welcome Back</h2>
          <p>Please enter your credentials to continue</p>
        </div>

        {error && (
          <div className="login-error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
            <button 
              onClick={() => setError('')} 
              className="error-close"
              aria-label="Close error message"
            >
              &times;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-container">
              <i className="fas fa-user input-icon"></i>
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                required
                autoFocus
                placeholder="Username"
                className={error ? 'error-input' : ''}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-container">
              <i className="fas fa-lock input-icon"></i>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                placeholder="Password"
                className={error ? 'error-input' : ''}
              />
            </div>
          </div>

          <div className="options-row">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <button type="button" className="forgot-link">Forgot password?</button>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading || !credentials.username || !credentials.password}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="divider">
          <span>Or continue with</span>
        </div>

        <div className="social-login">
          <button className="social-btn google">
            <i className="fab fa-google"></i>
          </button>
          <button className="social-btn microsoft">
            <i className="fab fa-microsoft"></i>
          </button>
          <button className="social-btn github">
            <i className="fab fa-github"></i>
          </button>
        </div>

        <div className="login-footer">
          <p>Powered by <span>PSC ICT Team</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;