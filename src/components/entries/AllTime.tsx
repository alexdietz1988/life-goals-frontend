import { Fragment, useState, useContext } from 'react';
import _ from 'lodash';

import { DataContext } from '../../App';
import { Data, Timescale } from '../../utilities/interfaces';
import { timescales, getDate } from '../../utilities/dates';
import { TimeSection } from './TimeSection';

export const AllTime = () => {
    const { entries } = useContext(DataContext) as Data;
    const [showPast, setShowPast] = useState(false);

    const startDatesToDisplay = {
        day: [] as Date[],
        week: [] as Date[],
        month: [] as Date[],
        quarter: [] as Date[],
        year: [] as Date[],
        decade: [] as Date[],
        life: [] as Date[],
    }

    const isPast = (date: Date, timescale: Timescale) => {
        const startOfTimescale = getDate(timescale, 'Now');
        if (startOfTimescale === undefined) return false;
        if (date.getFullYear() < startOfTimescale.getFullYear()) return true;
        if (date.getMonth() < startOfTimescale.getMonth()) return true;
        if (date.getDate() < startOfTimescale.getDate()) return true;
        return false;
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
                if (!isDuplicate && (showPast || !isPast(d, timescale as Timescale))) datesForTimescale.push(d);
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
                    <TimeSection timescale={timescale} startDate={d} />
                </Fragment>)
        )
    }

    return (
        <>
        <div className='block'>
            <div className={'button mr-2 ' + (!showPast && 'is-primary')} 
                onClick={() => setShowPast(showPast => !showPast)}>
                Hide Past
                {!showPast && <span className='icon ml-1'><i className="delete is-small"/></span>}
            </div>

            <div className='select'>
                <select onChange={(e) => console.log(e.target.value)}>
                    {timescales.map((t, i) => <option key={i} className='button'>{t}</option>)}
                </select>
            </div>
            
        </div>

        {entries.filter(e => !e.timescale).length > 0 && <TimeSection />}
        {entries.filter(e => e.someday).length > 0 && <TimeSection someday={true} />}
        
        {timescales.every(t => startDatesToDisplay[t as keyof typeof startDatesToDisplay].length === 0)
            ? <div className='block'>Nothing here yet!</div>       
            : timescales.map((t, i) => {
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

        {entries.filter(e => e.timescale === 'life').length > 0 && 
        <div className='block my-6'>
            <div className='block'>
                <div className='block'>
                    <h2 className='title is-5 has-text-info timescale-label'>
                        Life
                    </h2>
                </div>
            </div>
            <TimeSection timescale='life'/>
        </div>}
        </>)
}