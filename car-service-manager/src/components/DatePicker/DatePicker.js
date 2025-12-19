import React from 'react';

function DatePicker({ selectedDate, onDateChange }) {
  const handleChange = (e) => {
    onDateChange(new Date(e.target.value));
  };

  return (
    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
      <label htmlFor="appointment-date" className="text-slate-500">Select Date</label>
      <input
        type="date"
        id="appointment-date"
        value={selectedDate.toISOString().substr(0, 10)}
        onChange={handleChange}
        className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
      />
    </div>
  );
}

export default DatePicker;
