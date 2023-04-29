export type Timescale = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'decade' | 'life';

export interface Entry {
    _id: string,
    type: 'goal' | 'note',
    areaId?: string,
    timescale?: Timescale | '',
    startDate?: string,
    primaryText?: string,

    secondaryText?: string,
    complete?: boolean,
    someday: boolean,
    starred: boolean,

    createdAt?: Date,
}

export interface Area {
    _id: string,
    label: string,
    parent?: string,
}

export interface Data {
    entries: Array<Entry>,
    areas: Array<Area>,
}

export interface Settings {
    timescale: string,
    setTimescale: Function,
    timePeriodStart: object, 
    setTimePeriodStart: Function, 
    setLoading: Function
}