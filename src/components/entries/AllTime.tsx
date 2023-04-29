import { Fragment, useContext } from 'react';
import _ from 'lodash';

import { DataContext } from '../../App';
import { Data } from '../../utilities/interfaces';
import { timescales } from '../../utilities/dates';
import { TimeSection } from './TimeSection';

export const AllTime = () => {
    const { entries } = useContext(DataContext) as Data;

    const startDatesToDisplay = {
        day: [] as Date[],
        week: [] as Date[],
        month: [] as Date[],
        quarter: [] as Date[],
        year: [] as Date[],
        decade: [] as Date[],
        life: [] as Date[],
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
                if (!isDuplicate) datesForTimescale.push(d);
                }}
        )
        datesForTimescale.sort();
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
                        {t === 'life' ? 'Life' : _.capitalize(t) + 's'}
                    </h2>
                </div>
                {displayTimescale(t)}
            </div>)}
        )}
        </>)
}