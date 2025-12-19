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
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 pb-12 pt-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
          <h1 className="text-2xl font-semibold text-slate-900">Accounts</h1>
          <p className="mt-2 text-sm text-slate-500">
            Search customer records, review service history, and confirm vehicle details.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search by Vehicle Reg"
              value={searchReg}
              onChange={handleSearchChange}
              className="w-full max-w-xs rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <span className="text-xs text-slate-400">
              Showing {searchReg === '' ? accounts.length : filteredAccounts.length} results
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Vehicle Reg</th>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Customer Phone</th>
                  <th className="px-6 py-4">Vehicle Make</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(searchReg === '' ? accounts : filteredAccounts).map(account => (
                  <tr key={account.vehicleReg} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">{account.vehicleReg}</td>
                    <td className="px-6 py-4 text-slate-600">{account.customerName}</td>
                    <td className="px-6 py-4 text-slate-600">{account.customerPhone}</td>
                    <td className="px-6 py-4 text-slate-600">{account.vehicleMake}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleViewServiceHistory(account.vehicleReg)}
                        className="rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
                      >
                        View History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedAccount && (
          <>
            <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedAccount(null)}></div>
            <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Service History</h2>
                  <p className="mt-1 text-sm text-slate-500">Vehicle Reg: {selectedAccount}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAccount(null)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:text-brand-700"
                >
                  Close
                </button>
              </div>
              <div className="mt-5 max-h-[60vh] space-y-3 overflow-y-auto pr-2">
                {serviceHistory.length > 0 ? (
                  serviceHistory.map(appointment => (
                    <div key={appointment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div
                        className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-slate-800"
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
                      </div>
                      <Collapse isOpened={appointment.isOpen}>
                        <div className="mt-3 space-y-3 text-sm text-slate-600">
                          <p>
                            <span className="font-semibold text-slate-700">Technician:</span> {appointment.tech}
                          </p>
                          <div>
                            <p className="font-semibold text-slate-700">Tasks:</p>
                            <ul className="mt-2 space-y-1">
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
                                <li>No tasks available</li>
                              )}
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700">Comments:</p>
                            <p className="mt-1 text-slate-600">{appointment.details.comments || 'No comments available'}</p>
                          </div>
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
      </main>
    </div>
  );
};

export default AccountsPage;
