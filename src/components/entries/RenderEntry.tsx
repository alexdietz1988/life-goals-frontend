import { useContext } from 'react';
import _ from 'lodash';

import { DataContext, SettingsContext } from '../../App';
import { backend } from '../../utilities/backend';
import { monthNames } from '../../utilities/dates';
import { Entry, Data, Settings } from '../../utilities/interfaces';

interface RenderEntryProps {
    entry: Entry,
    setEntryIdToEdit: Function,
}

export const RenderEntry = ({ entry, setEntryIdToEdit }: RenderEntryProps ) => {
    const { areas } = useContext(DataContext) as Data;
    const { setLoading } = useContext(SettingsContext) as Settings;
    const toggleComplete = async () => {
        await backend.patch('entry', { entryId: entry._id, complete: !entry.complete })
        setLoading(true);
    }

    const renderAreaLabel = (areaId: string) => {
        const foundArea = areas.find(area => area._id === areaId);
        return foundArea && (
            <span key={areaId} className='tag mr-2'>
                {foundArea.label}
            </span>)
    }

    const renderDate = () => {
        let [date, month, quarter, year] = ['', '', '', '']
        if (entry.startDate) {
            const startDate = new Date(entry.startDate);
            date = startDate.getDate().toString();
            month = monthNames[startDate.getMonth()];
            quarter = Math.floor(startDate.getMonth() / 3 + 1).toString();
            year = startDate.getFullYear().toString();
        }
        switch (entry.timescale) {
            case 'day':
                return `${date} ${month}`;
            case 'week':
                return `Week of ${date} ${month}`;
            case 'month':
                return month;
            case 'quarter':
                return 'Q' + quarter;
            case 'year':
                return year;
            case 'decade':
                return year + 's';
            case 'life':
                return 'Life';
        }
    }

    return (
        <div className='entry'>
            <div className='hoverable left-container'>
                <div className='icon-container'>
                    {entry.type === 'note' && <span className={'tag is-light is-warning'}>Note</span>}
                    {entry.type === 'goal' && <input type='checkbox' checked={entry.complete} onChange={toggleComplete}/>}
                    {entry.starred && <span className='icon'><i className={'fas fa-star starred'}/></span>}
                    
                </div>
                <span className='entry-label' onClick={() => setEntryIdToEdit(entry._id)}>{entry.primaryText}</span>
            </div>
            <div className='hoverable right-container'>
                <div className='is-inline'>
                    {entry.areaId && renderAreaLabel(entry.areaId)}
                </div>
                {(entry.timescale || entry.someday) && <span className='tag mr-2 is-warning'>{entry.timescale ? renderDate() : 'someday'}</span>}
            </div>
        </div>
    )
}