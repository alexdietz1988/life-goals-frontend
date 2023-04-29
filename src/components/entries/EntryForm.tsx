import { useState, useContext } from 'react';
import { UserContext, DataContext, SettingsContext } from '../../App';
import { Area, Entry, Data, Settings, Timescale } from '../../utilities/interfaces';
import { backend } from '../../utilities/backend';

import { EntryFormUI } from './EntryFormUI';

interface EntryFormProps {
    entry?: Entry
    setEntryIdToEdit?: Function,
    selectedType?: 'goal' | 'note',
    pageVersion?: boolean,
}

interface FormData {
    primaryText: string,
    secondaryText: string,
    complete: boolean,
    starred: boolean,
    someday: boolean,
    areaId: string,
    startDate: Date | undefined,
    timescale: Timescale | undefined;
    createdAt: Date,
}

export const EntryForm = ({ entry, setEntryIdToEdit, selectedType, pageVersion }: EntryFormProps) => {
    let type = 'goal';
    if (entry && entry.type) type = entry.type;
    if (selectedType) type = selectedType;
    const { areas } = useContext(DataContext) as Data;
    const { setLoading } = useContext(SettingsContext) as Settings;
    const userId = useContext(UserContext);

    const getEntryStartDate = (entry: Entry) => {
        if (entry.startDate) {
            const year = parseInt(entry.startDate.slice(0,4));
            const month = parseInt(entry.startDate.slice(5,7)) - 1;
            const date = parseInt(entry.startDate.slice(8,10));
            return new Date(year, month, date);
        }
        else return new Date(0);
    }
    
    const [expandForm, setExpandForm] = useState(Boolean(entry) || pageVersion);
    const formDefaults: FormData = {
        primaryText: entry && entry.primaryText ? entry.primaryText : '',
        complete: entry && entry.complete ? entry.complete : false,
        starred: entry ? entry.starred : false,
        someday: entry ? entry.someday : false,

        timescale: entry && entry.timescale ? entry.timescale : undefined,
        startDate: entry && entry.startDate ? getEntryStartDate(entry) : undefined,
        areaId: entry && entry.areaId ? entry.areaId : '',

        secondaryText: '',
        createdAt: entry && entry.createdAt ? entry.createdAt : new Date(),
    }
    const [formData, setFormData] = useState(formDefaults);

    const hasParent = (area: Area) => area.parent && area.parent !== '';
    const parentAreas = areas.filter((area: Area) => !hasParent(area));
    const siblingIsSelected = (area: Area) => {
        const siblingIds = areas.filter((a: Area) => a.parent === area.parent).map((a: Area) => a._id);
        if (siblingIds.some(id => formData.areaId === id)) return true;
    }
    const childrenToDisplay = areas.filter((area: Area) => 
        hasParent(area) && 
        (area.parent && formData.areaId === area.parent || 
        formData.areaId === area._id ||
        siblingIsSelected(area)));
    
    const postEntry = async () => {
        console.log(formData);
        if (entry) await backend.put('entry', {entryId: entry._id, userId, type, ...formData});
        else await backend.post('entry', {userId, type, ...formData});
        setLoading(true);
        if (setEntryIdToEdit) setEntryIdToEdit('');
    }

    const deleteEntry = async () => {
        if (entry) await backend.delete(entry.type, { data: { entryId: entry._id } });
    }

    const restoreDefaults = () => {
        setFormData(formDefaults);
        if (setEntryIdToEdit) setEntryIdToEdit('');
        setExpandForm(false);
    }

    const getDate = (t: Timescale, relativeTime: 'Now' | 'Later'): Date | undefined => {
        const [day, week, month, quarter, year, decade] = [new Date(), new Date(), new Date(), new Date(), new Date(), new Date()];

        if (relativeTime === 'Later') day.setDate(day.getDate() + 1);

        if (relativeTime === 'Now') week.setDate(week.getDate() - week.getDay());
        else week.setDate(week.getDate() - week.getDay() + 7);

        month.setDate(1);
        if (relativeTime === 'Later') month.setMonth(month.getMonth() + 1);

        if (relativeTime === 'Now') quarter.setMonth(quarter.getMonth() - quarter.getMonth() % 3);
        else quarter.setMonth(quarter.getMonth() - quarter.getMonth() % 3 + 3);
        quarter.setDate(1);

        if (relativeTime === 'Now') {
            year.setMonth(0);
            year.setDate(1);
        } else {
            year.setMonth(0);
            year.setDate(1);
            year.setFullYear(year.getFullYear() + 1);
        }

        if (relativeTime === 'Now') {
            decade.setFullYear(decade.getFullYear() - decade.getFullYear() % 10);
            decade.setMonth(0);
            decade.setDate(1);
        } else {
            decade.setFullYear(decade.getFullYear() - decade.getFullYear() % 10 + 10);
            decade.setMonth(0);
            decade.setDate(1);
        }

        const dates = { day, week, month, year, quarter, decade, life: undefined};
        if (dates[t as keyof typeof dates]) return dates[t as keyof typeof dates];
    }

    const isDateMatch = (t: Timescale, relativeTime: 'Now' | 'Later') => {
        const convertDateToString = (date?: string | undefined) => {
            if (!date) return undefined;
            const year = date.slice(0,4);
            const month = date.slice(4,6) + 1;
            const day = date.slice(6,8);
            return `${year}-${month}-${day}`;
        }
        if (!formData.startDate) return false;
        const formDateAsString = convertDateToString(formData.startDate.toString());
        const selectedDate = getDate(t, relativeTime);
        if (!selectedDate) return false;
        const selectedDateAsString = convertDateToString(selectedDate.toString());
        return formData.timescale === t && formDateAsString === selectedDateAsString;
    }

    const handleToggle = (field: string): void => {
        setFormData((formData: FormData) => {
            return {...formData, [field]: !formData[field as keyof FormData]}})
    }

    const handleEnterPrimaryText = (text: string): void => {
        setFormData((formData: FormData) => {
            return {...formData, primaryText: text}})
    }

    return (
        <form className='form control entry-form' onSubmit={e => {
            e.preventDefault();
            postEntry();
            restoreDefaults();
            }}>
            {type === 'goal' && (
                <div className='inline-input' onFocus={() => setExpandForm(true)}>
                    <input className='hoverable' type='checkbox' checked={formData.complete} onChange={() => handleToggle('complete')} />
                    <span className='icon hoverable' onClick={() => handleToggle('starred')}>
                        <i className={'fas fa-star ' + (formData.starred ? 'starred' : 'unstarred')}/>
                    </span>
                    <input type='text' className='input'
                        placeholder='What do you want to accomplish?' value={formData.primaryText}
                        onChange={e => handleEnterPrimaryText(e.target.value)} />
                </div>)
            }

            {type === 'note' && (
            <input type='text' className='textarea' onFocus={() => setExpandForm(true)}
                placeholder='Add a new note' value={formData.primaryText}
                onChange={e => handleEnterPrimaryText(e.target.value)} />
            )}
            {expandForm && (type === 'goal' || type === 'note') && <EntryFormUI 
                formData={formData} 
                setFormData={setFormData} 
                type={type}
                editMode={!!entry}
                parentAreas={parentAreas}
                childrenToDisplay={childrenToDisplay}
                getDate={getDate}
                isDateMatch={isDateMatch}
                restoreDefaults={restoreDefaults}
                submitText={entry ? 'Update' : 'Add'}
                deleteEntry={deleteEntry}
                pageVersion={pageVersion}
                />}
        </form>
    )
}