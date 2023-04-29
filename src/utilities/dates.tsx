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