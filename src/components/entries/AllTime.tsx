import { Fragment, useState, useContext, useEffect } from 'react';
import _ from 'lodash';

import { UserContext, DataContext } from '../../App';
import { Timescale, Entry, UserContextInterface, Data } from '../../utilities/interfaces';
import { timescales, getDate } from '../../utilities/dates';
import { TimeSection } from './TimeSection';
import { backend, filterEntries } from '../../utilities/utils';

export const AllTime = () => {
    const [relativeTimesToShow, setRelativeTimesToShow] = useState({ past: false, present: true, future: true });
    const [selectedTimescale, setSelectedTimescale] = useState('');

    const { userId } = useContext(UserContext) as UserContextInterface;
    const [entries, setEntries] = useState<Entry[]>([]);
    const fetchEntries = async () => {
        const response = await backend.get('entry', { params: { userId } });
        setEntries(response.data);
    }
    useEffect(() => {fetchEntries();}, [userId])
    
    const { areas, selectedAreaId } = useContext(DataContext) as Data;
    const getEntriesForTimescale = (timescale?: string, startDate?: Date, someday?: boolean) => {
        return (filterEntries(areas, entries, selectedAreaId, timescale, startDate, someday));
    }
    const specialEntries = {
        anytime: getEntriesForTimescale(),
        life: getEntriesForTimescale('life'),
        someday: getEntriesForTimescale(undefined, undefined, true),
    }

    const startDatesToDisplay = {
        day: [] as Date[],
        week: [] as Date[],
        month: [] as Date[],
        quarter: [] as Date[],
        year: [] as Date[],
        decade: [] as Date[],
        life: [] as Date[],
    }

    const getRelativeTime = (date: Date, timescale: Timescale) => {
        const startOfTimescale = getDate(timescale, 'Now');
        if (startOfTimescale === undefined) return undefined;
        if (date.getFullYear() === startOfTimescale.getFullYear() && 
            date.getMonth() === startOfTimescale.getMonth() && 
            date.getDate() === startOfTimescale.getDate()) {
            return 'present';
        } else if (date.getTime() > startOfTimescale.getTime()) {
            return 'future';
        } else if (date.getTime() < startOfTimescale.getTime()) {
            return 'past';
        }
    }

    for (let timescale of timescales) {
        const datesForTimescale = startDatesToDisplay
            [timescale as keyof typeof startDatesToDisplay];
        entries.forEach(entry => {
            if (entry.timescale === timescale && entry.startDate) {
                const year = parseInt(entry.startDate.slice(0,4));
                const month = parseInt(entry.startDate.slice(5,7)) - 1;
                const date = parseInt(entry.startDate.slice(8,10));
                const d = new Date(year, month, date);
                const isDuplicate = datesForTimescale.some(date => date.getTime() === d.getTime());
                const isRelativeTimeMatch = relativeTimesToShow[getRelativeTime(d, timescale as Timescale) as keyof typeof relativeTimesToShow];
                const selectedTimescaleMatch = !selectedTimescale || selectedTimescale === timescale;
                if (!isDuplicate && isRelativeTimeMatch && selectedTimescaleMatch) datesForTimescale.push(d);
                }}
        )
        startDatesToDisplay[timescale as keyof typeof startDatesToDisplay] = datesForTimescale.sort((a,b) => a.getTime() - b.getTime());
    }
    
    const renderTimescale = (timescale: string) => {
        const datesForTimescale = startDatesToDisplay
            [timescale as keyof typeof startDatesToDisplay];
        if (datesForTimescale.length === 0) return <></>;
        return datesForTimescale.map((d, i) => {
            const entriesForTimeSection = getEntriesForTimescale(timescale, d);
            return (
                <Fragment key={i}>
                    {entriesForTimeSection.length > 0 && 
                        <TimeSection 
                            timescale={timescale} 
                            startDate={d} 
                            fetchEntries={fetchEntries} 
                            entries={entriesForTimeSection} />}
                </Fragment>
            );} )
    }

    return (
        <>
        <div className='block all-time-header'>
            <div className='buttons'>
                {['past', 'present', 'future'].map((relativeTime, i) => {
                    const showRelativeTime = relativeTimesToShow[relativeTime as keyof typeof relativeTimesToShow];
                    return (
                <div key={i}
                    className={'button ' + (showRelativeTime && 'is-primary')}
                    onClick={() => setRelativeTimesToShow(prevState => {
                        return { ...prevState,
                        [relativeTime]: !showRelativeTime}
                        })}>
                    {_.capitalize(relativeTime)}
                    {showRelativeTime && <span className='icon ml-1'><i className="delete is-small"/></span>}
                </div>)})}
            </div>

            <div className='select'>
                <select onChange={(e) => setSelectedTimescale(e.target.value)}>
                    <option value=''>Filter...</option>
                    <option value='anytime'>Anytime</option>
                    {timescales.map((t, i) => <option key={i} value={t} className='button'>{t === 'life' ? 'Life' : _.capitalize(t) + 's'}</option>)}
                    <option value='someday'>Someday</option>
                </select>
            </div>
            
        </div>

        {(specialEntries.anytime.length > 0 && relativeTimesToShow.present && 
            (!selectedTimescale || selectedTimescale === 'anytime')) && 
            <TimeSection fetchEntries={fetchEntries} entries={specialEntries.anytime}/>}
        
        {timescales.map((t, i) => {
                if (startDatesToDisplay[t as keyof typeof startDatesToDisplay].length === 0) return <Fragment key={i}></Fragment>;
                return (
                <div key={i} className='block my-6'>
                    <div className='block'>
                        <h2 className='title is-5 has-text-info timescale-label'>
                            {_.capitalize(t) + 's'}
                        </h2>
                    </div>
                    {renderTimescale(t)}
                </div>)}
        )}

        {(specialEntries.life.length > 0 && 
            relativeTimesToShow.present && 
            selectedTimescale === 'life') && 
        <div className='block my-6'>
            <div className='block'>
                <div className='block'>
                    <h2 className='title is-5 has-text-info timescale-label'>
                        Life
                    </h2>
                </div>
            </div>
            <TimeSection timescale='life' fetchEntries={fetchEntries} entries={specialEntries.life} />
        </div>}

        {(specialEntries.someday.length > 0 && relativeTimesToShow.future && 
            (!selectedTimescale || selectedTimescale === 'someday')) && 
            <TimeSection someday={true} fetchEntries={fetchEntries} entries={specialEntries.someday} />}
        </>)
}