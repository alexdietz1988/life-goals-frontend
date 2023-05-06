import { Fragment, useState, useContext } from 'react';

import { DataContext, SettingsContext } from '../../App';
import { Entry, Data, Settings, Timescale } from '../../utilities/interfaces';
import { dayNames, monthNames } from '../../utilities/dates';
import { EntryForm } from './EntryForm';
import { RenderEntry } from './RenderEntry';

interface TimeSectionProps {
    isCurrentFocus?: boolean,
    timescale?: string,
    someday?: boolean,
    startDate?: Date,
    jumpToTimescale?: Function,
}

export const TimeSection = ({ isCurrentFocus, timescale, someday, startDate, jumpToTimescale }: TimeSectionProps) => {
    const [ entryIdToEdit, setEntryIdToEdit ] = useState('');
    const [showEntryForm, setShowEntryForm] = useState(false);
    const [entryFormType, setEntryFormType] = useState< 'goal' | 'note' | undefined>(undefined);
    const { entries } = useContext(DataContext) as Data;
    const { setLoading } = useContext(SettingsContext) as Settings;

    const dateMatch = (entry: Entry) => {
        let sameDate = false;
        if (startDate && entry.startDate) {
            const year = parseInt(entry.startDate.slice(0,4));
            const month = parseInt(entry.startDate.slice(5,7)) - 1;
            const date = parseInt(entry.startDate.slice(8,10));
            sameDate = year === startDate.getFullYear() && month === startDate.getMonth() && date === startDate.getDate();
        } 
        const noDate = !startDate && !entry.startDate;
        return sameDate || noDate;
    }

    const entriesInTimePeriod = entries.filter(entry => {
        const noTimescale = !timescale && !Boolean(entry.timescale);
        const sameTimescale = timescale === entry.timescale;
        const timescaleMatch = (!someday && !entry.someday) && (sameTimescale || noTimescale);
        const somedayMatch = someday && entry.someday;
        return timescaleMatch && dateMatch(entry) || somedayMatch;
    })

    const starredGoals = entriesInTimePeriod.filter(entry => entry.type === 'goal' && entry.starred);
    const unstarredGoals = entriesInTimePeriod.filter(entry => entry.type === 'goal' && !entry.starred);
    const notes = entriesInTimePeriod.filter(entry => entry.type === 'note');

    const label = () => {
        const date = startDate ? startDate.getDate() : 0;
        const month = startDate ? startDate.getMonth() : 0;
        const year = startDate ? startDate.getFullYear() : 0;

        const renderDate = date.toString();
        const renderMonth = monthNames[month];
        const renderYear = year.toString();

        if (timescale === 'life') return 'Life';
        if (someday) return 'Someday';
        if (!timescale) return 'Anytime';
        
        // Today's date
        const d = new Date();
        const w = new Date();
        // Set w to the start of the current week
        w.setDate(w.getDate() - w.getDay());
        const getQuarter = (month: number) => Math.floor((month + 3) / 3);

        switch (timescale) {
            case 'day':
                if (date === d.getDate() && month === d.getMonth() && year === d.getFullYear()) return 'Today';
                if (date === d.getDate() - 1 && month === d.getMonth() && year === d.getFullYear()) return 'Yesterday';
                if (date === d.getDate() + 1 && month === d.getMonth() && year === d.getFullYear()) return 'Tomorrow';
                const day = startDate ? dayNames[new Date(startDate.getFullYear() || 0, startDate.getMonth() || 0, date).getDay()] : '';
                return `${day} ${renderDate} ${renderMonth}`;
            case 'week':
                if (date === w.getDate() && month === w.getMonth() && year === w.getFullYear()) return 'This Week';
                if (date === w.getDate() + 7 && month === w.getMonth() && year === w.getFullYear()) return 'Next Week';
                if (date === w.getDate() - 7 && month === w.getMonth() && year === w.getFullYear()) return 'Last Week';
                return `Week of ${renderDate} ${renderMonth}`;
            case 'month':
                if (month === d.getMonth() && year === d.getFullYear()) return 'This Month';
                if (month === d.getMonth() - 1 && year === d.getFullYear()) return 'Last Month';
                if (month === d.getMonth() + 1 && year === d.getFullYear()) return 'Next Month';
                return `${renderMonth} ${renderYear}`;
            case 'quarter':
                if (getQuarter(month) === getQuarter(d.getMonth()) && year === d.getFullYear()) return 'This Quarter';
                if (getQuarter(month) === getQuarter(d.getMonth()) - 1 && year === d.getFullYear()) return 'Last Quarter';
                if (getQuarter(month) === getQuarter(d.getMonth()) + 1 && year === d.getFullYear()) return 'Next Quarter';
                return `Q${month - month % 3 - 1} ${renderYear}`;
            case 'year':
                if (year === d.getFullYear()) return 'This Year';
                if (year === d.getFullYear() - 1) return 'Last Year';
                if (year === d.getFullYear() + 1) return 'Next Year';
                return renderYear;
            case 'decade':
                if (year === Math.floor(d.getFullYear()/10) * 10) return 'This Decade';
                if (year === Math.floor(d.getFullYear()/10) * 10 - 10) return 'Last Decade';
                if (year === Math.floor(d.getFullYear()/10) * 10 + 10) return 'Next Decade';
                return `${renderYear}s`;
            case 'life':
                return 'Life';
        }
        return `${timescale} - ${renderDate} ${renderMonth} ${renderYear}`;
      }
    
    const renderEntryOrForm = (entry: Entry, key: number) => (
        <Fragment key={key}>
        {entryIdToEdit === entry._id
        ? <EntryForm
            entry={entry}
            dismissForm={() => {
                setEntryIdToEdit('');
                setLoading(true);
            }}/>
        : <RenderEntry 
            entry={entry}
            setEntryIdToEdit={setEntryIdToEdit}/>}
        </Fragment>)

    const handleToggleEntryForm = (type: 'goal' | 'note'): void => {
        if (!showEntryForm) {
            setShowEntryForm(true);
            setEntryFormType(type);
        } else if (showEntryForm && entryFormType === type) {
            setShowEntryForm(false);
            setEntryFormType(undefined);
        } else {
            setEntryFormType(type);
        }
    }

    return (
    <div className='box time-section'>

        <div className='block header'>
            <h2 className={'time-section-title is-inline is-5 mr-3 ' + (isCurrentFocus === false && 'hoverable has-text-link')} onClick={() => {
                if (jumpToTimescale && isCurrentFocus === false) jumpToTimescale(timescale)}
                }>{label()}</h2>
            <div className='button mr-2' onClick={() => handleToggleEntryForm('goal')}>
                +
            </div>
            <div className='button new-entry-button' onClick={() => handleToggleEntryForm('note')}>
                <span className='icon'><i className='fa-regular fa-note-sticky' /></span>
            </div>
        </div>

        {showEntryForm && <EntryForm 
            selectedType={entryFormType} 
            startDate={startDate} 
            timescale={timescale as Timescale} 
            someday={someday} 
            dismissForm={() => {
                setShowEntryForm(false);
                setLoading(true);
            }}
        />}

        {starredGoals.map((entry: Entry, i: number) => renderEntryOrForm(entry, i))}
        {unstarredGoals.map((entry: Entry, i: number) => renderEntryOrForm(entry, i))}
        {notes.map((entry: Entry, i: number) => renderEntryOrForm(entry, i))}
    </div>
    )
}