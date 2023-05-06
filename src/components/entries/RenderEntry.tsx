import { useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { DataContext, SettingsContext } from '../../App';
import { backend } from '../../utilities/backend';
import { Entry, Data, Settings } from '../../utilities/interfaces';

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
                    <input type='checkbox' checked={entry.complete} onChange={toggleComplete}/>
                    {entry.starred && <span className='icon'><i className={'fas fa-star starred'}/></span>}
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
        <ReactMarkdown remarkPlugins={[remarkGfm]} children={entry.primaryText ? entry.primaryText : ''} />
        <div className='area-tag mt-2'>
            {entry.areaId && renderAreaLabel(entry.areaId)}
        </div>
    </div>)
}