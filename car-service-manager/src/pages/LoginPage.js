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
    <div className="min-h-screen bg-slate-950">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]"></div>
        <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <div className="grid w-full max-w-4xl gap-10 rounded-3xl border border-white/10 bg-white/5 p-10 text-white shadow-2xl shadow-slate-950/40 backdrop-blur">
            <div className="flex flex-col gap-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                <img src="/assets/ASG_Logo_white.jpg" alt="Logo" className="h-10 w-10 object-contain" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-white/60">ASG Live</p>
                <h2 className="text-3xl font-semibold">Welcome back</h2>
                <p className="mt-2 text-sm text-white/70">
                  Sign in to manage appointments, accounts, and technician hours.
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Username or Email</label>
                <input
                  type="text"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 shadow-inner focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="Enter your username or email"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 pr-12 text-white placeholder:text-white/40 shadow-inner focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 transition hover:text-white"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>
              {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
              <button
                type="submit"
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-white/20 transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Log In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
