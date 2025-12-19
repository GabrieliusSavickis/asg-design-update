import React from 'react';

function DatePicker({ selectedDate, onDateChange }) {
  const handleChange = (e) => {
    onDateChange(new Date(e.target.value));
  };

  return (
    <div className="date-picker">
      <label className="field-label" htmlFor="appointment-date">Select date</label>
      <input
        type="date"
        id="appointment-date"
        value={selectedDate.toISOString().substr(0, 10)}
        onChange={handleChange}
        className="input"
      />
    </div>
  );
}

export default DatePicker;
