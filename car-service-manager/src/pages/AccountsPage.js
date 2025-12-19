import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Header from '../components/Header/Header';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';

import { Collapse } from 'react-collapse';

const AccountsPage = () => {
  // Determine the domain
  const hostname = window.location.hostname;
  let locationSuffix = '';

  if (hostname.includes('asgennislive.ie')) {
    locationSuffix = '_ennis'; // Ennis site
  } else if (hostname.includes('asglive.ie')) {
    locationSuffix = ''; // Main site
  }

  // Define the collection names
  const accountsCollectionName = 'accounts' + locationSuffix;



  const [accounts, setAccounts] = useState([]);
  const [searchReg, setSearchReg] = useState('');
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null); // Track selected account
  const [serviceHistory, setServiceHistory] = useState([]);
  const navigate = useNavigate();

  // Fetch the user role from sessionStorage
  useEffect(() => {
    const role = sessionStorage.getItem('userRole');

    // If the role is not available or the user is a technician, redirect to appointments
    if (!role || role === 'technician') {
      navigate('/appointments');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const accountsCollection = collection(firestore, accountsCollectionName);
      const accountsSnapshot = await getDocs(accountsCollection);
      const accountsList = accountsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAccounts(accountsList);
    };

    fetchAccounts();
  }, [accountsCollectionName]); // Add accountsCollectionName as a dependency

  const handleSearchChange = (e) => {
    const value = e.target.value.toUpperCase();
    setSearchReg(value);

    if (value === '') {
      setFilteredAccounts([]);
    } else {
      const filtered = accounts.filter(account =>
        account.vehicleReg.includes(value)
      );
      setFilteredAccounts(filtered);
    }
  };

  const handleViewServiceHistory = async (vehicleReg) => {
    const appointmentsRef = collection(firestore, `appointments${locationSuffix}`);
    const q = query(appointmentsRef, where('details.vehicleReg', '==', vehicleReg));
    const querySnapshot = await getDocs(q);
    const appointmentsList = querySnapshot.docs.map(doc => {
      const appointment = doc.data();
      // Combine date and startTime
      const date = appointment.date; // Assuming this is a string like "Wed Sep 25 2024"
      const time = appointment.startTime || appointment.details.startTime; // Get startTime from appointment
      // Create a Date object from the date and time
      const dateTimeString = `${date} ${time}`;
      const dateTime = new Date(dateTimeString);
      // Format the date and time
      const options = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // Use 24-hour format
      };
      const formattedDateTime = dateTime.toLocaleString('en-US', options);

      return {
        id: doc.id,
        ...appointment,
        formattedDateTime,
        isOpen: false, // Add isOpen property
      };
    });

    setSelectedAccount(vehicleReg);
    setServiceHistory(appointmentsList);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Directory</p>
            <h1 className="text-3xl font-semibold">Accounts</h1>
            <p className="mt-2 text-sm text-slate-500">
              Quickly search customer vehicles and review full service histories.
            </p>
          </div>
          <div className="w-full max-w-sm">
            <label className="text-sm font-medium text-slate-600">Search by vehicle reg</label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <input
                type="text"
                placeholder="e.g. 231-D-12345"
                value={searchReg}
                onChange={handleSearchChange}
                className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Vehicle Reg</th>
                <th className="px-5 py-4">Customer Name</th>
                <th className="px-5 py-4">Customer Phone</th>
                <th className="px-5 py-4">Vehicle Make</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(searchReg === '' ? accounts : filteredAccounts).map((account) => (
                <tr key={account.vehicleReg} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">{account.vehicleReg}</td>
                  <td className="px-5 py-4 text-slate-600">{account.customerName}</td>
                  <td className="px-5 py-4 text-slate-600">{account.customerPhone}</td>
                  <td className="px-5 py-4 text-slate-600">{account.vehicleMake}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleViewServiceHistory(account.vehicleReg)}
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                    >
                      History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {selectedAccount && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedAccount(null)}></div>
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Service history</p>
                <h2 className="text-xl font-semibold text-slate-900">{selectedAccount}</h2>
              </div>
              <button
                onClick={() => setSelectedAccount(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                Close
              </button>
            </div>
            <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-2">
              {serviceHistory.length > 0 ? (
                serviceHistory.map(appointment => (
                  <div key={appointment.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <button
                      className="flex w-full items-center justify-between text-left text-sm font-semibold text-slate-700"
                      onClick={() =>
                        setServiceHistory(prev =>
                          prev.map(app =>
                            app.id === appointment.id
                              ? { ...app, isOpen: !app.isOpen }
                              : app
                          )
                        )
                      }
                    >
                      <span>Date: {appointment.formattedDateTime}</span>
                      <span className="text-slate-400">
                        {appointment.isOpen ? <FaChevronUp /> : <FaChevronDown />}
                      </span>
                    </button>
                    <Collapse isOpened={appointment.isOpen}>
                      <div className="mt-3 text-sm text-slate-600">
                        <p className="font-semibold text-slate-800">Technician: {appointment.tech}</p>
                        <p className="mt-2 font-semibold text-slate-800">Tasks:</p>
                        <ul className="mt-2 space-y-2">
                          {appointment.details.tasks && appointment.details.tasks.length > 0 ? (
                            appointment.details.tasks.map((task, index) => (
                              <li key={index} className="flex items-center gap-2">
                                {task.completed ? (
                                  <FaCheckCircle className="text-emerald-500" />
                                ) : (
                                  <FaTimesCircle className="text-rose-500" />
                                )}
                                <span>{task.text}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-slate-400">No tasks available</li>
                          )}
                        </ul>
                        <p className="mt-3 text-sm text-slate-500">
                          <span className="font-semibold text-slate-700">Comments:</span>{' '}
                          {appointment.details.comments || 'No comments available'}
                        </p>
                      </div>
                    </Collapse>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No service history available for this vehicle.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountsPage;
