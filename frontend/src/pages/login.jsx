import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { buildApiUrl } from '../config/api';

const Login = ({ onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '' });
  const [passwordMatch, setPasswordMatch] = useState({ match: false, message: '' });
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Reset reCAPTCHA when mode changes
  React.useEffect(() => {
    setRecaptchaValue(null);
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  }, [isLoginMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate password strength when password field changes
    if (name === 'password') {
      const strength = validatePasswordStrength(value);
      setPasswordStrength(strength);
      
      // Check password match when password changes
      if (formData.confirmPassword) {
        const match = value === formData.confirmPassword;
        setPasswordMatch({
          match,
          message: match ? 'Passwords match' : 'Passwords do not match'
        });
      }
    }
    
    // Check password match when confirm password changes
    if (name === 'confirmPassword') {
      const match = value === formData.password;
      setPasswordMatch({
        match,
        message: match ? 'Passwords match' : 'Passwords do not match'
      });
    }
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@gmail\.com$/;
    return emailRegex.test(email);
  };

  const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    let score = 0;
    let message = '';
    
    if (password.length >= minLength) score++;
    if (hasUpperCase) score++;
    if (hasLowerCase) score++;
    if (hasNumbers) score++;
    if (hasSpecialChar) score++;
    
    if (score === 0) message = 'Very Weak';
    else if (score === 1) message = 'Weak';
    else if (score === 2) message = 'Fair';
    else if (score === 3) message = 'Good';
    else if (score === 4) message = 'Strong';
    else if (score === 5) message = 'Very Strong';
    
    return { score, message };
  };

  const handleRecaptchaChange = (value) => {
    console.log('reCAPTCHA value:', value);
    setRecaptchaValue(value);
    if (error && error.includes('reCAPTCHA')) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if reCAPTCHA is completed for both login and registration
    if (!recaptchaValue) {
      setError('Please complete the reCAPTCHA verification');
      return;
    }

    // Validate email format (must end with @gmail.com)
    if (!validateEmail(formData.email)) {
      setError('Email must be a valid Gmail address (ending with @gmail.com)');
      return;
    }

    // Validate password confirmation for registration
    if (!isLoginMode && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength for registration
    if (!isLoginMode && passwordStrength.score < 3) {
      setError('Password must be at least "Good" strength. Include uppercase, lowercase, numbers, and special characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = isLoginMode ? '/users/login' : '/users/register';
      const requestData = isLoginMode 
        ? { email: formData.email, password: formData.password }
        : { fullName: formData.fullName, email: formData.email, password: formData.password };

      console.log('Sending request to:', endpoint);
      // Removed sensitive data logging for security

      const response = await fetch(buildApiUrl(endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        console.log('Response not ok:', response.status, data);
        throw new Error(data.error || 'Something went wrong');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (isLoginMode) {
        // For login, redirect to dashboard
        console.log('Login successful:', data);
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        navigate('/dashboard');
      } else {
        // For registration, show success message and switch to login mode
        setSuccess('Registration successful! Please login with your credentials.');
        setTimeout(() => {
          setIsLoginMode(true);
          setSuccess('');
          setFormData({
            fullName: '',
            email: '',
            password: '',
            confirmPassword: ''
          });
        }, 2000);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModeToggle = (mode) => {
    setIsLoginMode(mode);
    // Reset form data when switching modes
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
    setPasswordStrength({ score: 0, message: '' });
    setPasswordMatch({ match: false, message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex h-[800px]">
          {/* Left Panel */}
          <div className="w-2/7 bg-gradient-to-br from-green-300 to-green-500 flex flex-col items-center justify-center p-8">
            <div className="space-y-6 w-full max-w-xs">
              <button 
                onClick={() => handleModeToggle(true)}
                className={`w-full font-bold py-4 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                  isLoginMode 
                    ? 'bg-green-700 text-white' 
                    : 'bg-white text-green-700'
                }`}
              >
                LOGIN
              </button>
              <button 
                onClick={() => handleModeToggle(false)}
                className={`w-full font-bold py-4 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                  !isLoginMode 
                    ? 'bg-green-700 text-white' 
                    : 'bg-white text-green-700'
                }`}
              >
                SIGN IN
              </button>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-4/5 bg-white flex flex-col items-center justify-center p-8 overflow-y-auto">
            <div className={`w-full mx-auto ${isLoginMode ? 'max-w-lg' : 'max-w-md'}`}>
              {/* Logo/Title */}
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-green-700">
                  {isLoginMode ? 'Login' : 'Register'}
                </h1>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3 w-full">
                {/* Full Name - Only show in registration mode */}
                {!isLoginMode && (
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                      className="w-full px-3 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors duration-200 text-sm"
                      required={!isLoginMode}
                    />
                  </div>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    className="w-full px-3 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors duration-200 text-sm"
                    required
                  />
                </div>

                {/* Password */}
                <div key="password">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                      className="w-full px-3 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors duration-200 pr-10 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 z-20 bg-white rounded p-1"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator - Only show in registration mode */}
                  {!isLoginMode && formData.password && (
                    <div className="mt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Password Strength:</span>
                        <span className={`font-medium ${
                          passwordStrength.score >= 4 ? 'text-green-600' :
                          passwordStrength.score >= 3 ? 'text-yellow-600' :
                          passwordStrength.score >= 2 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {passwordStrength.message}
                        </span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.score >= 4 ? 'bg-green-500' :
                            passwordStrength.score >= 3 ? 'bg-yellow-500' :
                            passwordStrength.score >= 2 ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        ></div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Requirements: 8+ chars, uppercase, lowercase, number, special character
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password - Only show in registration mode */}
                {!isLoginMode && (
                  <div key="confirm-password">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm Password"
                        className="w-full px-3 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors duration-200 pr-10 text-sm"
                        required={!isLoginMode}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 z-20 bg-white rounded p-1"
                      >
                        {showConfirmPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    
                    {/* Password Match Indicator - Only show in registration mode */}
                    {!isLoginMode && formData.confirmPassword && (
                      <div className="mt-1">
                        <div className="flex items-center text-xs">
                          <span className={`font-medium ${
                            passwordMatch.match ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {passwordMatch.message}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Remember Me - Only show in login mode */}
                {isLoginMode && (
                  <div className="flex items-center text-xs">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3 h-3 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="ml-2 text-xs text-gray-700">Remember me</span>
                    </label>
                  </div>
                )}

                                {/* CAPTCHA - Show in both login and registration modes */}
                <div className="bg-gray-50 p-1 rounded-lg border border-gray-200 flex justify-center">
                  <ReCAPTCHA
                    key={isLoginMode ? 'login' : 'register'}
                    ref={recaptchaRef}
                    sitekey="6Lf2W48rAAAAAL_p6dthIe0GtcXJkU3zUjRxBUyX"
                    onChange={handleRecaptchaChange}
                  />
                </div>

                {/* Success Message */}
                {success && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Success!</strong>
                    <span className="block sm:inline"> {success}</span>
                  </div>
                )}

                                {/* Error Message */}
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (isLoginMode ? 'Logging In...' : 'Signing Up...') : (isLoginMode ? 'LOGIN' : 'SIGN IN')}
                  </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
