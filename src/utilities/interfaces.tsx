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
    selectedAreaId: string,
    areas: Array<Area>,
}

export interface UserContextInterface {
    userId: string,
    setUserId: Function,
}

export interface Settings {
    timescale: string,
    setTimescale: Function,
    timePeriodStart: object, 
    setTimePeriodStart: Function,
    setDefaultTimes: Function,
    fetchEntries: Function,
    fetchAreas: Function,
}