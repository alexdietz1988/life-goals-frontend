import { useEffect, useState } from 'react';
import _ from 'lodash';

import { timescales } from '../../utilities/dates';
import { Timescale } from '../../utilities/interfaces';
import { TimeSection } from './TimeSection';

export const FocusView = ({ defaultTimes, setDefaultTimes }: { defaultTimes: boolean, setDefaultTimes: Function }) => {
  const [timescale, setTimescale] = useState('day' as Timescale);
  const now = new Date();
  const [startDate, setStartDate] = useState(now);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const broaderTimescale: string = timescales[timescales.indexOf(timescale) + 1];
  const narrowerTimescale: string = timescales[timescales.indexOf(timescale) - 1];

  useEffect(() => {
    if (defaultTimes) {
      setStartDate(now);
      setTimescale('day');
      setDefaultTimes(false);
    }
  }, [defaultTimes]);

  const w = new Date();
  w.setDate(w.getDate() - w.getDay());
  const defaults = {
    day: new Date(),
    week: w,
    month: new Date(now.getFullYear(), now.getMonth(), 1),
    quarter: new Date(now.getFullYear(), (Math.floor((now.getMonth() + 3) / 3) * 3), 1),
    year: new Date(now.getFullYear(), 1, 1),
    decade: new Date((Math.floor(now.getFullYear() / 10) * 10), 1, 1),
    life: new Date(0),
  }

  const goForwardOrBackwardInTime = (shift: number) => {
    const d = new Date(startDate);
    switch (timescale) {
      case 'day':
        d.setDate(d.getDate() + shift);
        break;
      case 'week':
        d.setDate(d.getDate() + 7 * shift);
        break;
      case 'month':
        d.setMonth(d.getMonth() + shift);
        break;
      case 'quarter':
        d.setMonth(d.getMonth() + (3 * shift));
        break;
      case 'year':
        d.setFullYear(d.getFullYear() + shift);
        break;
      case 'decade':
        d.setFullYear(d.getFullYear() + 10 * shift);
        break;
    }
    setStartDate(d);
  }

  const getBroaderTimescaleStart = () => {
    switch (timescale) {
      case 'day':
        const w = new Date();
        w.setDate(now.getDate() - now.getDay());
        return w;
      case 'week':
        const m = new Date();
        m.setDate(1);
        return m;
      case 'month':
        const q = new Date();
        q.setDate(1);
        q.setMonth(Math.floor(q.getMonth() / 3) * 3);
        return q;
      case 'quarter':
        const y = new Date();
        y.setDate(1);
        y.setMonth(0);
        return y;
      case 'year':
        const decade = new Date();
        decade.setDate(1);
        decade.setMonth(0);
        decade.setFullYear(Math.floor(decade.getFullYear()/10) * 10);
        return decade;
      case 'decade':
      case 'life':
        return new Date(0);
    }
  }

  const jumpToTimescale = (t: Timescale) => {
    if (timescales.indexOf(t) === timescales.indexOf(timescale) + 1) {
      setStartDate(getBroaderTimescaleStart());
    } else {
      setStartDate(defaults[t])
    }
    setTimescale(t);
  }

  const label = (t: string) => {
    if (t === 'day') return 'Today';
    if (t === 'life') return 'Life';
    else return 'This ' + _.capitalize(t);
  }

  return (
  <>
    <div className='buttons'>
      {timescale !== 'life' && 
      <>
        <div className='button' onClick={() => goForwardOrBackwardInTime(-1)}>Previous {_.capitalize(timescale)}</div>
        <div className='button' onClick={() => goForwardOrBackwardInTime(1)}>Next {_.capitalize(timescale)}</div>
      </>}
      <div className={'dropdown ' + (dropdownOpen && 'is-active')}>
        <div className='dropdown-trigger'>
          <button className='button' aria-haspopup='true' aria-controls='dropdown-menu'
            onClick={() => setDropdownOpen(!dropdownOpen)}>
            <span>Jump to...</span>
            <span className='icon is-small'>
              <i className='fas fa-angle-down' aria-hidden='true'></i>
          </span>
          </button>
        </div>
      <div className='dropdown-menu' id='dropdown-menu' role='menu'>
        <div className='dropdown-content'>
          {timescales.map((t,i) => 
            <div key={i} className='dropdown-item' onClick={() => {
              jumpToTimescale(t as Timescale); 
              setDropdownOpen(false);
            }}><a>{label(t)}</a></div>)}
        </div>
      </div>
      </div>
      {narrowerTimescale && 
      <button className='button ml-2 is-warning is-light' onClick={() => jumpToTimescale(narrowerTimescale as Timescale)}>
        Back to {_.capitalize(narrowerTimescale) + 's'}
      </button>}
    </div>

    {timescale === 'life' ?
      <TimeSection 
        timescale={timescale}
        jumpToTimescale={jumpToTimescale}
      />
      : <TimeSection 
        timescale={timescale}
        startDate={startDate}
        jumpToTimescale={jumpToTimescale}
      />
    }

    {broaderTimescale && broaderTimescale === 'life' &&
      <TimeSection 
        isCurrentFocus={false}
        timescale={broaderTimescale}
        jumpToTimescale={jumpToTimescale}
      />}
    {broaderTimescale && broaderTimescale !== 'life' &&
      <TimeSection 
        isCurrentFocus={false}
        timescale={broaderTimescale}
        jumpToTimescale={jumpToTimescale}
        startDate={getBroaderTimescaleStart()}
      />
    }

    <TimeSection />
    <TimeSection someday={true} />
  </>
  )
}