import { Fragment, useState } from 'react';

import { Entry, Timescale } from '../../utilities/interfaces';
import { getDateLabel } from '../../utilities/dates';
import { EntryForm } from './EntryForm';
import { RenderEntry } from './RenderEntry';

interface TimeSectionProps {
    isCurrentFocus?: boolean,
    timescale?: string,
    someday?: boolean,
    startDate?: Date,
    jumpToTimescale?: Function,
    entries: Entry[],
    fetchEntries: Function,
    compact?: boolean,
}

export const TimeSection = ({ isCurrentFocus, timescale, someday, startDate, jumpToTimescale, entries, fetchEntries, compact }: TimeSectionProps) => {
    const [entryIdToEdit, setEntryIdToEdit] = useState('');
    const [showEntryForm, setShowEntryForm] = useState(false);
    const [entryFormType, setEntryFormType] = useState< 'goal' | 'note' | undefined>(undefined);

    const starredGoals = entries.filter(entry => entry.type === 'goal' && entry.starred);
    const unstarredGoals = entries.filter(entry => entry.type === 'goal' && !entry.starred);
    const notes = entries.filter(entry => entry.type === 'note');

    const renderEntryOrForm = (entry: Entry, key: number) => (
        <Fragment key={key}>
        {entryIdToEdit === entry._id
        ? <EntryForm
            entry={entry}
            dismissForm={(cancel?: string) => {
                setEntryIdToEdit('');
                if (!cancel) fetchEntries();
            }}/>
        : <RenderEntry 
            entry={entry}
            setEntryIdToEdit={setEntryIdToEdit}
            compact={compact}/>}
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
    <div className={'time-section ' + (!compact && 'box')}>

        {!compact && <div className='block header'>
            <h2 className={'time-section-title is-inline is-5 mr-3 ' + (isCurrentFocus === false && 'hoverable has-text-link')} onClick={() => {
                if (jumpToTimescale && isCurrentFocus === false) jumpToTimescale(timescale)}
                }>{getDateLabel(startDate, timescale, someday)}</h2>
            <div className='button mr-2' onClick={() => handleToggleEntryForm('goal')}>
                +
            </div>
            <div className='button new-entry-button' onClick={() => handleToggleEntryForm('note')}>
                <span className='icon'><i className='fa-regular fa-note-sticky' /></span>
            </div>
        </div>}

        {showEntryForm && <EntryForm 
            selectedType={entryFormType} 
            startDate={startDate} 
            timescale={timescale as Timescale} 
            someday={someday} 
            dismissForm={() => {
                setShowEntryForm(false);
                fetchEntries();
            }}
        />}

        {starredGoals.map((entry: Entry, i: number) => renderEntryOrForm(entry, i))}
        {unstarredGoals.map((entry: Entry, i: number) => renderEntryOrForm(entry, i))}
        {notes.map((entry: Entry, i: number) => renderEntryOrForm(entry, i))}
    </div>
    )
}