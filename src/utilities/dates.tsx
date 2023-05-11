export const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const timescales = ['day', 'week', 'month', 'quarter', 'year', 'decade', 'life']

export function getWeekStart(d: Date, offset: number) {
  d.setDate(d.getDate() - d.getDay() + (offset * 7));
  return d;
}

export function getQuarter(month: number) {
  return (month - (month % 4)) / 4
}

export const getDate = (t: string, relativeTime: 'Now' | 'Later'): Date | undefined => {
    const d = new Date();
    const isNow = relativeTime === 'Now';
    if (t === 'day' && !isNow) {
        d.setDate(d.getDate() + 1);
    } else if (t === 'week') {
        const weekStart = d.getDate() - d.getDay();
        d.setDate(isNow ? weekStart : weekStart + 7);
    } else if (t === 'month') {
        d.setDate(1);
        if (!isNow) d.setMonth(d.getMonth() + 1);
    } else if (t === 'quarter') {
        d.setDate(1);
        const quarterStart = d.getMonth() - d.getMonth() % 3;
        d.setMonth(isNow ? quarterStart : quarterStart + 3);
    } else if (t === 'year') {
        d.setMonth(0);
        d.setDate(1);
        if (!isNow) d.setFullYear(d.getFullYear() + 1);
    } else if (t === 'decade') {
        d.setMonth(0);
        d.setDate(1);
        const decadeStart = d.getFullYear() - d.getFullYear() % 10;
        d.setFullYear(isNow ? decadeStart : decadeStart + 10)
    } else if (t === 'life') {
        return undefined;
    }
    return d;
}

export const getDateLabel = (startDate?: Date, timescale?: string, someday?: boolean) => {
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