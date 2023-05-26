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
    compact?: boolean
}

export const RenderEntry = ({ entry, setEntryIdToEdit, compact }: RenderEntryProps ) => {
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
    const renderDateLabel = () => {
        const date = entry.startDate ? new Date(entry.startDate) : undefined;
        const timescale = entry.timescale ? entry.timescale : undefined;
        return <span className='tag is-info mr-2'>{getDateLabel(date, timescale)}</span>;
    }

    return entry.type === 'goal' ? (
        <div className='goal'>
            <div className='hoverable left-container'>
                {entry.type === 'goal' && <div className={'icon-container ' + (compact && 'icon-container--compact')}>
                    {!compact && <span className='icon' onClick={toggleStarred}><i className={'fas fa-star ' + (isStarred ? 'starred' : 'unstarred')}/></span>}
                    <input className='hoverable' type='checkbox' defaultChecked={entry.complete} onClick={toggleComplete}/>
                </div>}
                <div className={'goal-label ' + (compact && 'goal-label--compact')} onClick={() => setEntryIdToEdit(entry._id)}><ReactMarkdown children={entry.primaryText ? entry.primaryText : ''} /></div>
            </div>
            <div className='area-tag'>
                {compact && renderDateLabel()}
                {!compact && entry.areaId && renderAreaLabel(entry.areaId)}
            </div>
        </div>
    )
    : (
    <div className='note hoverable' onClick={() => setEntryIdToEdit(entry._id)}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {entry.primaryText ? entry.primaryText : ''}
        </ReactMarkdown>
        <div className='area-tag mt-2'>
            {compact && renderDateLabel()}
            {entry.createdAt && <span className='tag is-info is-light mr-1'>{getDateLabel(new Date(entry.createdAt), 'day') + ' ' + new Date(entry.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
            {entry.areaId && renderAreaLabel(entry.areaId)}
        </div>
    </div>)
}