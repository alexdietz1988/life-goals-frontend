import { useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { DataContext, SettingsContext } from '../../App';
import { backend } from '../../utilities/backend';
import { Entry, Data, Settings } from '../../utilities/interfaces';
import { getDateLabel } from '../../utilities/dates'

interface RenderEntryProps {
    entry: Entry,
    setEntryIdToEdit: Function,
}

export const RenderEntry = ({ entry, setEntryIdToEdit }: RenderEntryProps ) => {
    const { areas } = useContext(DataContext) as Data;
    const { fetchEntries } = useContext(SettingsContext) as Settings;
    const toggleComplete = async () => {
        await backend.patch('entry', { entryId: entry._id, complete: !entry.complete })
        fetchEntries();
    }
    const toggleStarred = async () => {
        await backend.patch('entry', { entryId: entry._id, starred: !entry.starred })
        fetchEntries();
    }

    const renderAreaLabel = (areaId: string) => {
        const foundArea = areas.find(area => area._id === areaId);
        return foundArea && (
            <span key={areaId} className='tag'>
                <p>{foundArea.label}</p>
            </span>)
    }

    return entry.type === 'goal' ? (
        <div className='goal'>
            <div className='hoverable left-container'>
                {entry.type === 'goal' && <div className='icon-container'>
                    <span className='icon' onClick={toggleStarred}><i className={'fas fa-star ' + (entry.starred ? 'starred' : 'unstarred')}/></span>
                    <input type='checkbox' checked={entry.complete} onChange={toggleComplete}/>
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