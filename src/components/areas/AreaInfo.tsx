import { FormEvent, useRef, useState, useEffect } from 'react';
import _ from 'lodash';

import { backend } from '../../utilities/backend';

type AreaStatus = '' | 'green' | 'yellow' | 'red';

interface AreaInfo {
    _id: string,
    areaStatus: string,
    notes: string,
}

export const AreaInfo = ({ selectedAreaId }: { selectedAreaId: string}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [areaInfo, setAreaInfo] = useState({ _id: '', areaStatus: '', notes: ''} as AreaInfo);
    const textareaRef = useRef(null as any);
    const [newStatus, setNewStatus] = useState('');
    const getClassName = (areaStatus: string) => {
        if (areaStatus === 'green') return 'is-success';
        if (areaStatus === 'yellow') return 'is-warning';
        if (areaStatus === 'red') return 'is-danger';
    }

    const getAreaInfo = async () => {
        const response = await backend.get('area-info', { params: { areaId: selectedAreaId } });
        setAreaInfo(response.data[0]);
    }

    useEffect(() => { getAreaInfo(); }, [selectedAreaId])

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsEditing(false);
        await backend.put('area-info/', { areaInfoId: areaInfo._id, areaStatus: newStatus, notes: textareaRef.current.value, });
        getAreaInfo();
    }

    return (
    <>
        {!isEditing && 
        <div onClick={() => setIsEditing(true)}>
            {areaInfo && <div className={`tag is-medium hoverable ${getClassName(areaInfo.areaStatus)}`}>{_.capitalize(areaInfo.areaStatus)}</div>}
            <div>{areaInfo && areaInfo.notes}</div>
        </div>}

        {isEditing && 
        <form className='form control' onSubmit={e => onSubmit(e)}>
            <div>
                <span className='tag is-medium mr-2 is-light'><strong>Status</strong></span>
                <div className='tags are-medium is-inline has-addons'>
                {['green', 'yellow', 'red'].map((color, i) => {
                    return <div key={i}
                        className={`tag hoverable ${(newStatus === color ? '' : 'is-light')} 
                        ${getClassName(color)}`}
                        onClick={() => setNewStatus(newStatus => newStatus === color ? '' : color as AreaStatus)}>{_.capitalize(color)}</div>})}
                </div>
            </div>

            <textarea ref={textareaRef} className='input textarea' defaultValue={areaInfo.notes} />
            <div className='buttons'>
            <button type='submit' className='button is-link'>Save Changes</button>
            <div className='button' onClick={() => setIsEditing(false)}>Cancel</div>
            </div>
        </form>}
    </>)
}