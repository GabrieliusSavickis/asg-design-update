import React, { useState } from 'react';
import { auth, signInWithEmailAndPasswordFunction } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function LoginPage() {
  const [loginInput, setLoginInput] = useState(''); // This will hold either username or email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      let email = loginInput;

      // Check if the input is a username and fetch the associated email
      if (!loginInput.includes('@')) {
        const q = query(collection(firestore, 'users'), where('username', '==', loginInput));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Get the email associated with the username
          const userData = querySnapshot.docs[0].data();
          email = userData.email;
        } else {
          throw new Error('Username not found.');
        }
      }

      // Use the email for login
      await signInWithEmailAndPasswordFunction(auth, email, password);

      // Fetch the role after login
      const role = await fetchUserRole(email);

      // You can store the role in session storage or context/state management for future use
      sessionStorage.setItem('userRole', role); // Store the user's role

      setError('');
      navigate('/appointments');
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchUserRole = async (email) => {
    const q = query(collection(firestore, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      return userData.role; // Return the role of the user (e.g., 'admin', 'technician')
    }

    throw new Error('User role not found.');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img src="/assets/ASG_Logo_white.jpg" alt="Logo" className="login-logo" />
          <div>
            <p className="login-eyebrow">ASG Service Manager</p>
            <h2>Welcome back</h2>
            <p className="login-subtitle">
              Sign in to keep the workshop running smoothly.
            </p>
          </div>
        </div>
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="field-label">Username or Email</label>
            <input
              type="text"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              className="input"
              placeholder="Enter your username or email"
              required
            />
          </div>
          <div className="form-group password-group">
            <label className="field-label">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
    <div className="min-h-screen bg-slate-950/80 bg-[url('/assets/garage-background.jpg')] bg-cover bg-center">
      <div className="flex min-h-screen items-center justify-center bg-slate-950/60 px-4 py-12">
        <div className="w-full max-w-md rounded-3xl bg-white/90 p-8 shadow-card backdrop-blur">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600/10">
              <img src="/assets/ASG_Logo_white.jpg" alt="Logo" className="h-10 w-auto object-contain" />
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to manage appointments, accounts, and technician workloads.
            </p>
          </div>
          <form onSubmit={handleLogin} className="mt-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700">Username or Email</label>
              <input
                type="text"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative mt-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-700 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-brand-600"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Log In
            </button>
          </form>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            Need access? Contact your administrator to update your profile or reset credentials.
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn-primary login-button">
            Log In
          </button>
        </form>
        <div className="login-footer">
          <span className="badge">Secure access</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
