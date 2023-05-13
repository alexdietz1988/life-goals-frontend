import { FormEvent, useRef, useState, useEffect, useContext } from 'react';
import _ from 'lodash';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { DataContext } from '../../App';
import { backend } from '../../utilities/utils';
import { Data } from '../../utilities/interfaces';

type AreaStatus = '' | 'green' | 'yellow' | 'red';

interface AreaInfoInterface {
    _id: string,
    areaStatus: string,
    notes: string,
}

export const AreaInfo = ({ selectedAreaId }: { selectedAreaId: string}) => {
    const { areas } = useContext(DataContext) as Data;
    const areaLabel = areas.find(area => area._id === selectedAreaId)?.label;
    const [isEditing, setIsEditing] = useState(false);
    const [areaInfo, setAreaInfo] = useState({ _id: '', areaStatus: '', notes: ''} as AreaInfoInterface);
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
        {(!isEditing && areaInfo) &&
        <div className='box area-info' onClick={() => setIsEditing(true)}>
            <div className='area-info-label'>
                <div className='area-label'>{areaLabel}</div>
                <div className={`tag is-medium hoverable ${getClassName(areaInfo.areaStatus)}`}>
                    {areaInfo.areaStatus ? _.capitalize(areaInfo.areaStatus) : 'Set Status'}
                </div>
            </div>
            <div className='notes'>
            <div className='notes-label hoverable'>Notes</div>
            <div className='notes-content'>
                {areaInfo.notes 
                    ? <ReactMarkdown remarkPlugins={[remarkGfm]} children={areaInfo.notes} /> 
                    : <div className='textarea is-small content'>
                        <p>Write some notes about this area here.</p>
                    </div>
                    }
                </div>
            </div>
                
        </div>}

        {isEditing && 
        <form className='form control box area-info' onSubmit={e => onSubmit(e)}>
            <div className='area-info-label'>
                <div className='area-label'>{areaLabel}</div>
                <div className='tags are-medium is-inline has-addons'>
                {['green', 'yellow', 'red'].map((color, i) => {
                    return <div key={i}
                        className={`tag hoverable ${(newStatus === color ? '' : 'is-light')} 
                        ${getClassName(color)}`}
                        onClick={() => setNewStatus(newStatus => newStatus === color ? '' : color as AreaStatus)}>{_.capitalize(color)}</div>})}
                </div>
            </div>
            
            <div className='notes'>
                <div className='notes-label hoverable'>Notes</div>
                <textarea ref={textareaRef} className='input textarea notes-content' defaultValue={areaInfo.notes} placeholder={'Tip: You can also include markdown, like:\n**Bold** or *italics*\n- New paragraph\n - [ ] Todo'}/>
            </div>
            
            <div className='buttons'>
                <button type='submit' className='button is-link'>Save Changes</button>
                <div className='button' onClick={() => setIsEditing(false)}>Cancel</div>
            </div>
        </form>}
    </>)
}