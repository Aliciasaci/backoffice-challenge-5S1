import { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import PropTypes from 'prop-types';

function TimeRangePicker({ day, onTimeRangeChange, show }) {
    const hours = Array.from({ length: 24 }, (_, i) => ({ label: i.toString().padStart(2, '0'), value: i.toString().padStart(2, '0') }));
    const minutes = Array.from({ length: 60 }, (_, i) => ({ label: i.toString().padStart(2, '0'), value: i.toString().padStart(2, '0') }));

    // Set default values to 09:00 to 19:00
    const [startHour, setStartHour] = useState('09');
    const [startMinute, setStartMinute] = useState('00');
    const [endHour, setEndHour] = useState('19');
    const [endMinute, setEndMinute] = useState('00');

    const handleStartHourChange = (e) => {
        setStartHour(e.value);
        updateTimetable(e.value, startMinute, endHour, endMinute);
    };

    const handleStartMinuteChange = (e) => {
        setStartMinute(e.value);
        updateTimetable(startHour, e.value, endHour, endMinute);
    };

    const handleEndHourChange = (e) => {
        setEndHour(e.value);
        updateTimetable(startHour, startMinute, e.value, endMinute);
    };

    const handleEndMinuteChange = (e) => {
        setEndMinute(e.value);
        updateTimetable(startHour, startMinute, endHour, e.value);
    };

    const updateTimetable = (startTimeHour, startTimeMinute, endTimeHour, endTimeMinute) => {
        const timeRange = {
            startTime: `${startTimeHour}:${startTimeMinute}`,
            endTime: `${endTimeHour}:${endTimeMinute}`,
        };
        if (day && show) {
            onTimeRangeChange(timeRange, day);
        }
    };

    return (
        <div>
            { show ? 
            <div className="flex text-black text-xl font-bold space-x-2" style={{alignItems: 'center'}}>
                <Dropdown value={startHour} options={hours} onChange={handleStartHourChange} placeholder="Hour" />
                <span className='text-black pt-1 text-xl font-bold'>:</span>
                <Dropdown value={startMinute} options={minutes} onChange={handleStartMinuteChange} placeholder="Minute" />
                <span className='text-black pt-1 text-xl font-bold'>-</span>
                <Dropdown value={endHour} options={hours} onChange={handleEndHourChange} placeholder="Hour" />
                <span className='text-black pt-1 text-xl font-bold'>:</span>
                <Dropdown value={endMinute} options={minutes} onChange={handleEndMinuteChange} placeholder="Minute" />
            </div>
            : 
            <span className='text-sm text-black' >Fermé</span>
            }
        </div>
    );
}

TimeRangePicker.propTypes = {
    day: PropTypes.string.isRequired,
    onTimeRangeChange: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
};

export default TimeRangePicker;