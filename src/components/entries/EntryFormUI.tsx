import { useState } from 'react';
import _ from 'lodash';

import { Area, Timescale } from '../../utilities/interfaces';
import { timescales, getDate, getDateLabel } from '../../utilities/dates';

interface EntryFormUIProps {
    formData: FormData,
    setFormData: Function,
    type: 'goal' | 'note',
    editMode?: boolean,
    primaryTextRef: any,
    handleFormAction: Function,
    getAreas: { parentAreas: Area[], childrenToDisplay: Area[] },
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

export const EntryFormUI = ({ 
    formData,
    setFormData,
    type,
    editMode,
    primaryTextRef,
    handleFormAction,
    getAreas,
}: EntryFormUIProps ) => {
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

    const getStartDateLabel = (t?: Timescale, relativeTime?: string): string => {
        if (!t) return 'Someday';
        else if (t === 'life') return 'Life';
        else if (t === 'day') return relativeTime === 'Now' ? 'Today' : 'Tomorrow';
        else return (relativeTime === 'Now' ? 'This ' : 'Next ') + _.capitalize(t);
    }

    const handleSelectStartDate = (t: Timescale, relativeTime: 'Now' | 'Later'): void => {
        setFormData((formData: FormData) => { 
        return {...formData, 
            timescale: t, 
            startDate: getDate(t, relativeTime)}})
    }

    const renderArea = (area: Area, key: number) => (
        <div key={key} 
            className={'tag hoverable is-white ' + (formData.areaId === area._id && 'is-primary')} 
            onClick={() => setFormData((formData: FormData) => {
                return {...formData, areaId: formData.areaId === area._id ? '' : area._id}})}>
            {area.label}
            {formData.areaId === area._id && <div className="delete is-small"></div>}
        </div>)

    return (
        <form className='form control entry-form' onSubmit={e => handleFormAction('submit', e)}>
            {type === 'goal' && (
                <>
                <h2>Add a goal</h2>
                <div className='inline-input'>
                    <input className='hoverable' type='checkbox' checked={formData.complete}
                        onChange={() => setFormData((formData: FormData) => {
                            return {...formData,  complete: !formData.complete}})} />
                    <span className='icon hoverable'
                        onClick={() => setFormData((formData: FormData) => {
                            return {...formData, starred: !formData.starred}})}>
                        <i className={'fas fa-star ' + (formData.starred ? 'starred' : 'unstarred')}/>
                    </span>
                    <input type='text' className='input' ref={primaryTextRef}
                        placeholder='Enter your goal' defaultValue={formData.primaryText}
                        />
                </div>
                </>)
            }

            {type === 'note' && (
            <>
            <h2>Add a note</h2>
            <textarea className='textarea hoverable' ref={primaryTextRef} defaultValue={formData.primaryText}
                placeholder={'Tip: You can also include markdown, like:\n**Bold** or *italics*\n- New paragraph\n - [ ] Todo'}
                />
            </>
            )}
            <div className='select-date'>
                <h2>When?</h2>
                {(!formData.startDate && !formData.someday) && <>

                <div className='dropdowns'>
                    <div className='select'>
                        <select
                            onChange={e => handleSelectStartDate(e.target.value as Timescale, 'Now')}>
                            <option>Now</option>
                            {timescales.map((t, i) =>
                            <option key={i} value={t}>
                                {getStartDateLabel(t as Timescale, 'Now')}
                            </option>)}
                        </select>
                    </div>

                    <div className='select'>
                        <select
                            onChange={e => e.target.value === 'someday' 
                                ? setFormData((formData: FormData) => {
                                    return { ...formData, someday: true };}) 
                                : handleSelectStartDate(e.target.value as Timescale, 'Later')
                                }>
                            <option>Later</option>
                            {timescales.slice(0,-1).map((t, i) =>
                            <option key={i} value={t}>
                                {getStartDateLabel(t as Timescale, 'Later')}
                            </option>)}
                            <option value={'someday'}>
                                Someday
                            </option>
                        </select>
                    </div>
                </div>
                </>}

                {(formData.startDate || formData.someday) && 
                <div className='tag is-medium is-warning hoverable'
                    onClick={() => setFormData((formData: FormData) => {
                        return {...formData, timescale: undefined, startDate: undefined, someday: false}})}>
                    {getDateLabel(formData.startDate, formData.timescale, formData.someday)}
                    <span className='icon'><i className="delete is-small"/></span>
                </div>}
            </div>
        
            <div className='tags are-medium'>
                <div className={'tag hoverable is-white ' + (formData.areaId === '' && 'is-primary')} 
                    onClick={() => setFormData((formData: FormData) => {
                        return {...formData, areaId: ''}})}>
                    (None)
                </div>
                {getAreas.parentAreas.map((area, i) => renderArea(area, i))}
            </div>
            <div className='tags are-medium'>
                {getAreas.childrenToDisplay.map((area, i) => renderArea(area, i))}
            </div>

            <div className='buttons'>
                <button type='submit' className='button is-link'>{editMode ? 'Update' : 'Add'}</button>
                <div className='button' onClick={() => handleFormAction('cancel')}>Cancel</div>
                {editMode && <div className='button is-danger is-light' onClick={() => setShowConfirmDelete(true)}>Delete</div>}

                {showConfirmDelete &&
                <div className='modal is-active'>
                    <div className='modal-background'></div>
                    <div className='modal-content'>
                        <div className='box'>
                            <h2 className='title is-5'>Are you sure you want to delete this {type}?</h2>
                            <div className='button is-danger' onClick={() => handleFormAction('delete')}>Yes, Delete It</div>
                            <div className='button' onClick={() => setShowConfirmDelete(false)}>No, Back to Edit</div>
                        </div>
                    </div>
                </div>}
            </div>
        </form>
        )
}