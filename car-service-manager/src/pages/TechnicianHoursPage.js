import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { firestore } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Header from '../components/Header/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const TechnicianHoursPage = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [technicianHours, setTechnicianHours] = useState([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Determine the domain and set the location suffix
  const hostname = window.location.hostname;
  let locationSuffix = '';

  if (hostname.includes('asgennislive.ie')) {
    locationSuffix = '_ennis'; // Ennis site
  } else if (hostname.includes('asglive.ie')) {
    locationSuffix = ''; // Main site
  }

  // Define the collection name
  const appointmentsCollectionName = 'appointments' + locationSuffix;

  useEffect(() => {
    const fetchTechnicianHours = async () => {
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(firestore, appointmentsCollectionName),
        where('date', '>=', startOfDay.toDateString()),
        where('date', '<=', endOfDay.toDateString())
      );

      const querySnapshot = await getDocs(q);
      const hoursData = {};

      querySnapshot.forEach((doc) => {
        const appointment = doc.data();
        const { tasks } = appointment.details || {};

        if (tasks) {
          tasks.forEach((task) => {
            if (task.completed && task.completedBy) {
              if (!hoursData[task.completedBy]) {
                hoursData[task.completedBy] = 0;
              }
              hoursData[task.completedBy] += (task.timeSpent || 0) * 60000; // Convert minutes to milliseconds
            }
          });
        }
      });

      const formattedHours = Object.keys(hoursData).map((tech) => ({
        tech,
        hours: Math.floor(hoursData[tech] / 3600000),
        minutes: Math.floor((hoursData[tech] % 3600000) / 60000),
      }));

      setTechnicianHours(formattedHours);
    };

    fetchTechnicianHours();
  }, [startDate, endDate, appointmentsCollectionName]); // Add appointmentsCollectionName as a dependency

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Productivity</p>
            <h1 className="text-3xl font-semibold">Technician Hours</h1>
            <p className="mt-2 text-sm text-slate-500">
              Review completed work ranges and keep track of technician output.
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              <FontAwesomeIcon icon={faCalendarAlt} />
              Select date range
            </button>

            {isDatePickerOpen && (
              <div className="absolute right-0 top-14 z-20 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                <DatePicker
                  selected={startDate}
                  onChange={(dates) => {
                    const [start, end] = dates;
                    setStartDate(start);
                    setEndDate(end);
                  }}
                  startDate={startDate}
                  endDate={endDate}
                  selectsRange
                  inline
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Technician</th>
                <th className="px-5 py-4">Total Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {technicianHours.map((tech, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">{tech.tech}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {tech.hours} hours {tech.minutes} minutes
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default TechnicianHoursPage;
