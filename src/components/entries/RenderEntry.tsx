import { useContext, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { DataContext } from '../../App';
import { backend } from '../../utilities/utils';
import { Entry, Data } from '../../utilities/interfaces';
import { getDateLabel } from '../../utilities/dates'

interface RenderEntryProps {
    entry: Entry,
    setEntryIdToEdit: Function,
}

export const RenderEntry = ({ entry, setEntryIdToEdit }: RenderEntryProps ) => {
    const { areas, setSelectedAreaId } = useContext(DataContext) as Data;
    const [isComplete, setIsComplete] = useState<boolean>(Boolean(entry.complete));
    const [isStarred, setIsStarred] = useState<boolean>(Boolean(entry.starred));
    const toggleComplete = () => {
        backend.patch('entry', { entryId: entry._id, complete: !isComplete });
        setIsComplete(isComplete => !isComplete);
    }
    const toggleStarred = () => {
        backend.patch('entry', { entryId: entry._id, starred: !isStarred });
        setIsStarred(isStarred => !isStarred);
    }

    const renderAreaLabel = (areaId: string) => {
        const foundArea = areas.find(area => area._id === areaId);
        return foundArea && (
            <span key={areaId} className='tag hoverable' onClick={() => setSelectedAreaId(areaId)}>
                <p>{foundArea.label}</p>
            </span>)
    }

    return entry.type === 'goal' ? (
        <div className='goal'>
            <div className='hoverable left-container'>
                {entry.type === 'goal' && <div className='icon-container'>
                    <span className='icon' onClick={toggleStarred}><i className={'fas fa-star ' + (isStarred ? 'starred' : 'unstarred')}/></span>
                    <input className='hoverable' type='checkbox' defaultChecked={entry.complete} onClick={toggleComplete}/>
                </div>}
                <div className={'goal-label'} onClick={() => setEntryIdToEdit(entry._id)}><ReactMarkdown children={entry.primaryText ? entry.primaryText : ''} /></div>
            </div>
            <div className='area-tag'>
                {entry.areaId && renderAreaLabel(entry.areaId)}
            </div>
        </div>
    )
    : (
    <div className='note hoverable' onClick={() => setEntryIdToEdit(entry._id)}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {entry.primaryText ? entry.primaryText : ''}
        </ReactMarkdown>
        <div className='area-tag mt-2'>
            {entry.createdAt && <span className='tag is-info is-light mr-1'>{getDateLabel(new Date(entry.createdAt), 'day') + ' ' + new Date(entry.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
            {entry.areaId && renderAreaLabel(entry.areaId)}
        </div>
    </div>)
}