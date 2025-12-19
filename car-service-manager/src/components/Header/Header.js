import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { firestore } from '../../firebase';

function Header() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;

      if (user) {
        // Check if username and role are stored in session storage first
        let storedUsername = sessionStorage.getItem('username');
        let storedRole = sessionStorage.getItem('userRole');

        if (storedUsername && storedRole) {
          setUsername(storedUsername);
          setUserRole(storedRole);
        } else {
          // If not, fetch them from Firestore
          const q = query(collection(firestore, 'users'), where('email', '==', user.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setUsername(userData.username);
            setUserRole(userData.role); // Assuming role is stored in the user data
            sessionStorage.setItem('username', userData.username); // Store it in session storage for faster access
            sessionStorage.setItem('userRole', userData.role); // Store role in session storage
          }
        }
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      sessionStorage.clear(); // Clear session storage on logout
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Don't render the header for technicians
  if (userRole === 'technician') {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 shadow-lg shadow-slate-900/20">
            <img src="/assets/ASG_Logo_white.jpg" alt="Logo" className="h-8 w-8 object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">ASG</p>
            <p className="text-lg font-semibold text-slate-900">Service Manager</p>
          </div>
        </div>
        <nav className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <Link
            to="/appointments"
            className="rounded-full border border-slate-200 px-4 py-2 transition hover:border-slate-300 hover:text-slate-900"
          >
            Appointments
          </Link>
          <Link
            to="/accounts"
            className="rounded-full border border-slate-200 px-4 py-2 transition hover:border-slate-300 hover:text-slate-900"
          >
            Accounts
          </Link>
          <Link
            to="/technician-hours"
            className="rounded-full border border-slate-200 px-4 py-2 transition hover:border-slate-300 hover:text-slate-900"
          >
            Hours
          </Link>
          {username && (
            <span className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-slate-700 md:flex">
              Logged in as <span className="font-semibold text-slate-900">{username}</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
