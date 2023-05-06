import { useState, useContext, useRef, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router';

import { UserContext, DataContext } from '../../App';
import { Area, Entry, Data, Timescale, UserContextInterface } from '../../utilities/interfaces';
import { backend } from '../../utilities/backend';

import { EntryFormUI } from './EntryFormUI';

interface EntryFormProps {
    selectedType?: 'goal' | 'note',
    entry?: Entry
    dismissForm: Function,
    
    timescale?: Timescale,
    startDate?: Date,
    someday?: boolean,
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

export const EntryForm = ({ 
    selectedType, 
    entry,  
    dismissForm, 
    timescale, 
    startDate, 
    someday = false
}: EntryFormProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { areas, selectedAreaId } = useContext(DataContext) as Data;
    const { userId } = useContext(UserContext) as UserContextInterface;
    const primaryTextRef = useRef(null as any);

    const getFormType = () => {
        if (selectedType) return selectedType;
        else if (entry && entry.type) return entry.type;
        else return 'goal';
    }
    const type = getFormType();

    const getEntryStartDate = (entry: Entry) => {
        if (entry.startDate) {
            const year = parseInt(entry.startDate.slice(0,4));
            const month = parseInt(entry.startDate.slice(5,7)) - 1;
            const date = parseInt(entry.startDate.slice(8,10));
            return new Date(year, month, date);
        }
        else return new Date(0);
    }

    const [formData, setFormData] = useState<FormData>({ 
        primaryText: entry && entry.primaryText ? entry.primaryText : '',
        complete: entry && entry.complete ? entry.complete : false,
        starred: entry ? entry.starred : false,
        someday: entry ? entry.someday : someday,

        timescale: entry && entry.timescale ? entry.timescale : timescale,
        startDate: entry && entry.startDate ? getEntryStartDate(entry) : startDate,
        areaId: entry && entry.areaId ? entry.areaId : selectedAreaId,

        secondaryText: '',
        createdAt: entry && entry.createdAt ? entry.createdAt : new Date(),
    });

    const getAreas = () => {
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
        return { parentAreas, childrenToDisplay };
    }

    const getDate = (t: Timescale, relativeTime: 'Now' | 'Later'): Date | undefined => {
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
            if (isNow) d.setFullYear(d.getFullYear() + 1);
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

    const deleteEntry = async () => {
        if (entry) {
            await backend.delete('entry', { data: { entryId: entry._id } });
            dismissForm();
        }
    }

    const postEntry = async (e: FormEvent) => {
        e.preventDefault();
        const primaryText = primaryTextRef.current.value;
        if (entry) await backend.put('entry', {entryId: entry._id, userId, type, ...formData, primaryText});
        else await backend.post('entry', {userId, type, ...formData, primaryText});
        dismissForm();
    }

    const handleFormAction = (action: 'submit' | 'cancel' | 'delete', e?: FormEvent) => {
        if (action === 'submit' && e) postEntry(e);
        else if (action === 'delete') deleteEntry();
        else if (action === 'cancel') dismissForm();
    }

    return (
        <EntryFormUI 
            formData={formData} 
            setFormData={setFormData} 
            type={type as 'goal' | 'note'}
            editMode={!!entry}
            primaryTextRef={primaryTextRef}
            getAreas={getAreas()}
            getDate={getDate}
            handleFormAction={handleFormAction}
            />
    )
}