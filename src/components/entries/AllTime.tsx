import { Fragment, useState, useContext, useEffect } from 'react';
import _ from 'lodash';

import { UserContext } from '../../App';
import { Timescale, Entry, UserContextInterface } from '../../utilities/interfaces';
import { timescales, getDate } from '../../utilities/dates';
import { TimeSection } from './TimeSection';
import { backend } from '../../utilities/backend';

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
    
    const displayTimescale = (timescale: string) => {
        const datesForTimescale = startDatesToDisplay
            [timescale as keyof typeof startDatesToDisplay];
        return (datesForTimescale.length === 0) ? <></>
            : datesForTimescale.map((d, i) => (
                <Fragment key={i}>
                    <TimeSection timescale={timescale} startDate={d} entries={entries} fetchEntries={fetchEntries} />
                </Fragment>)
        )
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

        {(entries.filter(e => !e.timescale).length > 0 && 
            relativeTimesToShow.present && 
            (!selectedTimescale || selectedTimescale === 'anytime')) && 
            <TimeSection entries={entries} fetchEntries={fetchEntries} />}
        
        {timescales.map((t, i) => {
                if (startDatesToDisplay[t as keyof typeof startDatesToDisplay].length === 0) return <Fragment key={i}></Fragment>;
                return (
                <div key={i} className='block my-6'>
                    <div className='block'>
                        <h2 className='title is-5 has-text-info timescale-label'>
                            {_.capitalize(t) + 's'}
                        </h2>
                    </div>
                    {displayTimescale(t)}
                </div>)}
        )}

        {(entries.filter(e => e.timescale === 'life').length > 0 && 
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
            <TimeSection timescale='life' entries={entries} fetchEntries={fetchEntries} />
        </div>}

        {(entries.filter(e => e.someday).length > 0 && relativeTimesToShow.future && 
            (!selectedTimescale || selectedTimescale === 'someday')) && 
            <TimeSection someday={true} entries={entries} fetchEntries={fetchEntries} />}
        </>)
}