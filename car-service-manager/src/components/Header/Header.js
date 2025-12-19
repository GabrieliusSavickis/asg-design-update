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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600/10">
            <img src="/assets/ASG_Logo_white.jpg" alt="Logo" className="h-7 w-auto object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">ASG Service Desk</p>
            <p className="text-xs text-slate-500">Operations & scheduling</p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-3">
          <Link
            to="/appointments"
            className="rounded-full border border-transparent bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Appointments
          </Link>
          <Link
            to="/accounts"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700"
          >
            Accounts
          </Link>
          <Link
            to="/technician-hours"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700"
          >
            Hours
          </Link>
          {username && (
            <span className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 md:flex">
              Logged in as <span className="font-semibold text-slate-900">{username}</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-brand-200 hover:text-brand-700"
            aria-label="Log out"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
