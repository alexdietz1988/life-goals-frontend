import { Fragment, useState, useEffect, useContext } from 'react';

import { UserContext, DataContext } from '../../App';
import { backend } from '../../utilities/backend';
import { Entry, Data, UserContextInterface, Timescale } from '../../utilities/interfaces';
import { getDateLabel } from '../../utilities/dates';
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
    const [entryIdToEdit, setEntryIdToEdit] = useState('');
    const [showEntryForm, setShowEntryForm] = useState(false);
    const [entryFormType, setEntryFormType] = useState< 'goal' | 'note' | undefined>(undefined);
    const { areas, selectedAreaId } = useContext(DataContext) as Data;
    const { userId } = useContext(UserContext) as UserContextInterface;
    const [entries, setEntries] = useState([] as Array<Entry>);

    const fetchEntries = async () => {
        const entriesResponse = await backend.get('entry', { params: { userId } });
        setEntries(entriesResponse.data);
    }

    useEffect(() => {fetchEntries();}, [userId])

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

    const filterEntries = (): 
        { starredGoals: Entry[], unstarredGoals: Entry[], notes: Entry[] } => {
        const inSelectedArea = (entry: Entry): boolean => {
            const idsOfchildrenOfSelectedArea = areas.filter(area => 
                area.parent === selectedAreaId).map(area => area._id);
            const isInChildOfSelectedArea = entry.areaId && 
                idsOfchildrenOfSelectedArea.includes(entry.areaId);
            return !!(!selectedAreaId || 
                (entry.areaId && entry.areaId.includes(selectedAreaId) || isInChildOfSelectedArea))
        };
    
        const inTimePeriod = (entry: Entry): boolean => {
            const noTimescale = !timescale && !Boolean(entry.timescale);
            const sameTimescale = timescale === entry.timescale;
            const timescaleMatch = (!someday && !entry.someday) && (sameTimescale || noTimescale);
            const somedayMatch = someday && entry.someday;
            return !!(timescaleMatch && dateMatch(entry) || somedayMatch);
        }
        const entriesInTimePeriod = entries.filter(entry => 
            inSelectedArea(entry) && inTimePeriod(entry))
        const starredGoals = entriesInTimePeriod.filter(entry => 
            entry.type === 'goal' && entry.starred);
        const unstarredGoals = entriesInTimePeriod.filter(entry => 
            entry.type === 'goal' && !entry.starred);
        const notes = entriesInTimePeriod.filter(entry => entry.type === 'note');
        return {
            starredGoals, unstarredGoals, notes
        }
    }
    const { starredGoals, unstarredGoals, notes } = filterEntries();

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
                }>{getDateLabel(startDate, timescale, someday)}</h2>
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
                fetchEntries();
            }}
        />}

        {starredGoals.map((entry: Entry, i: number) => renderEntryOrForm(entry, i))}
        {unstarredGoals.map((entry: Entry, i: number) => renderEntryOrForm(entry, i))}
        {notes.map((entry: Entry, i: number) => renderEntryOrForm(entry, i))}
    </div>
    )
}