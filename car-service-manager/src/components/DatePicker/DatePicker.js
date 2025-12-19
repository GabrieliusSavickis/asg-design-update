import React from 'react';

function DatePicker({ selectedDate, onDateChange }) {
  const handleChange = (e) => {
    onDateChange(new Date(e.target.value));
  };

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="appointment-date" className="text-sm font-medium text-slate-600">
        Select Date
      </label>
      <input
        type="date"
        id="appointment-date"
        value={selectedDate.toISOString().substr(0, 10)}
        onChange={handleChange}
        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
    </div>
  );
}

export default DatePicker;
