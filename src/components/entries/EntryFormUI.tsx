import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Area, Timescale } from '../../utilities/interfaces';
import { timescales } from '../../utilities/dates';

interface EntryFormUIProps {
    formData: FormData,
    setFormData: Function,
    type: 'goal' | 'note',
    editMode?: boolean,
    parentAreas: Array<Area>,
    childrenToDisplay: Array<Area>,
    getDate: Function,
    isDateMatch: Function,
    restoreDefaults: Function,
    submitText: string,
    deleteEntry: Function,
    pageVersion?: boolean,
}

interface FormData {
    primaryText: string,
    complete: boolean,
    starred: boolean,
    someday: boolean,
    areaId: string,
    startDate: Date | undefined,
    timescale: Timescale | undefined;
}

type RelativeTime = 'Now' | 'Later';

export const EntryFormUI = ({ 
    formData, setFormData, type, pageVersion, editMode,
    parentAreas, childrenToDisplay, 
    getDate, isDateMatch, 
    restoreDefaults, deleteEntry, submitText }: EntryFormUIProps ) => {
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    
    const toggleSomeday = (): void => {
        setFormData((formData: FormData) => {
            return {...formData, someday: !formData.someday, startDate: undefined}})
    }

    const getStartDateLabel = (t: Timescale, relativeTime: string) => {
        const labels = {
            day: relativeTime === 'Now' ? 'Today' : 'Tomorrow',
            week: relativeTime === 'Now' ? 'This Week' : 'Next Week',
            month: relativeTime === 'Now' ? 'This Month' : 'Next Month',
            quarter: relativeTime === 'Now' ? 'This Quarter' : 'Next Quarter',
            decade: relativeTime === 'Now' ? 'This Decade' : 'Next Decade',
            year: relativeTime === 'Now' ? 'This Year' : 'Next Year',
            life: 'Life'
        }
        return labels[t as keyof typeof labels];
    }
    const [relativeTime, setRelativeTime] = useState('');
    const handleSelectRelativeTime = (x: RelativeTime): void => {
        setFormData((formData: FormData) => { 
            return {...formData, 
                timescale: 'day', 
                startDate: getDate('day', x)
            }});
        setRelativeTime(relativeTime === x ? '' : x);
    }

    const handleSelectStartDate = (t: Timescale): void => {
        setFormData((formData: FormData) => { 
        return {...formData, 
            timescale: t, 
            startDate: getDate(t, relativeTime)}})
    }

    const handleSelectAreaId = (areaId: string): void => {
        setFormData((formData: FormData) => {
            return {...formData, areaId: formData.areaId === areaId ? '' : areaId}});
    }

    const renderArea = (area: Area, key: number) => (
        <div key={key} 
            className={'tag hoverable ' + (formData.areaId === area._id && 'is-primary')} 
            onClick={() => handleSelectAreaId(area._id)}>
            {area.label}
            {formData.areaId === area._id && <button className="delete is-small"></button>}
        </div>)

    return <div className='box'>
            {(
            <div>
                <div className='buttons'>
                {['Now','Later'].map((x, i) => (
                    <div key={i} 
                        className={'button ' + (relativeTime === x && 'is-primary')} 
                        onClick={() => handleSelectRelativeTime(x as RelativeTime)}>{x}
                    </div>
                ))}
                <div className={'button ' + (formData.someday && 'is-warning')} onClick={() => toggleSomeday()}>
                        Someday
                    </div>
                </div>

                {relativeTime !== '' && <div className='select'>
                <select value={formData.timescale ? formData.timescale : ''} 
                    onChange={e => handleSelectStartDate(e.target.value as Timescale)}>
                    {timescales.map((t, i) => 
                    <option key={i} value={t}
                        className={'button ' + (isDateMatch(t as Timescale, relativeTime) && 'is-primary')}>
                        {getStartDateLabel(t as Timescale, relativeTime)}
                    </option>
                    )}
                </select>
                </div>}
            
                <div className='tags are-medium'>
                    <div className={'tag hoverable ' + (formData.areaId === '' && 'is-primary')} 
                        onClick={() => handleSelectAreaId('')}>
                        (None)
                    </div>
                    {parentAreas.map((area, i) => renderArea(area, i))}
                </div>
                <div className='tags are-medium'>
                    {childrenToDisplay.map((area, i) => renderArea(area, i))}
                </div>
                <div className='buttons'>
                    <button type='submit' className='button is-link'>{submitText}</button>
                    {pageVersion
                    ? <Link className='button' to='/'>Cancel</Link>
                    : <div className='button' onClick={() => restoreDefaults()}>Cancel</div>}
                    {editMode && <div className='button is-danger is-light' onClick={() => setShowConfirmDelete(true)}>Delete</div>}
                    {showConfirmDelete &&
                    <div className='modal is-active'>
                        <div className='modal-background'></div>
                        <div className='modal-content'>
                            <div className='box'>
                                <h2 className='title is-5'>Are you sure you want to delete this {type}?</h2>
                                <div className='button is-danger' onClick={() => deleteEntry()}>Yes, Delete It</div>
                                <div className='button' onClick={() => setShowConfirmDelete(false)}>No, Back to Edit</div>
                            </div>
                        </div>
                    </div>
                    }
                </div>
            </div>
            )}
    </div>
}