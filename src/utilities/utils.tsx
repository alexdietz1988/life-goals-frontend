import axios from 'axios';

import { Area, Entry } from "./interfaces";

export const backend = axios.create({ 
    baseURL: 'https://life-goals-backend.herokuapp.com/'
    // baseURL: 'http://localhost:4000/'
});

export const filterEntries = (
    areas: Area[], 
    entries: Entry[], 
    selectedAreaId: string, 
    timescale?: string, 
    startDate?: Date, 
    someday?: boolean
    ) => {
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
    return entries.filter(entry => inSelectedArea(entry) && inTimePeriod(entry));
}