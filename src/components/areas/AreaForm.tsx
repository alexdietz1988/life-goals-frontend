import { useState, useContext } from 'react';

import { UserContext, DataContext, SettingsContext } from '../../App';
import { Area, Data, Settings, UserContextInterface } from '../../utilities/interfaces';
import { backend } from '../../utilities/backend';

interface AreaFormProps {
    setAreaIdToEdit: Function,
    area?: Area
}

export const AreaForm = ({ area, setAreaIdToEdit }: AreaFormProps) => {
    const { userId } = useContext(UserContext) as UserContextInterface;
    const areasToDisplay = (useContext(DataContext) as Data).areas.filter((a: Area) => !area || a._id !== area._id);
    const { setLoading } = useContext(SettingsContext) as Settings;
    const [expandForm, setExpandForm] = useState(Boolean(area));

    const [label, setLabel] = useState(area ? area.label : '');
    const [selectedParent, setSelectedParent] = useState('');

    const hasParent = (area: Area) => area.parent && area.parent !== '';
    const parentAreas = areasToDisplay.filter((area: Area) => !hasParent(area));
    const siblingIsSelected = (area: Area) => {
        const siblingIds = areasToDisplay.filter((a: Area) => a.parent === area.parent).map((a: Area) => a._id);
        if (siblingIds.includes(selectedParent)) return true;
    }
    const childrenToDisplay = areasToDisplay.filter((area: Area) => hasParent(area) && (area.parent === selectedParent || area._id === selectedParent || siblingIsSelected(area)));
    
    const renderArea = (area: Area, key: number) => <div key={key}
        className={'tag hoverable ' + (selectedParent === area._id && 'is-primary')}
        onClick={() => setSelectedParent(area._id)}>
        {area.label}
    </div>

    const postArea = async () => {
        setAreaIdToEdit('');
        setLabel('');
        setExpandForm(false);
        if (area) await backend.put('area', { areaId: area._id, label, parent: selectedParent });
        else await backend.post('area', { userId, label, parent: selectedParent });
        setLoading(true);
    }

    return (
        <form className='form control block' onSubmit={e => {
            e.preventDefault();
            postArea();
            }}>
            <div><input type='text' className='input is-inline my-2 mr-2' value={label}
                placeholder='Enter a new life area...'
                onFocus={() => setExpandForm(true)}
                onChange={e => setLabel(e.target.value)} /></div>

            {expandForm && 
            <>
                <label>Nest under...</label>
                <div className='tags are-medium'>
                    <div
                        className={'tag hoverable ' + (selectedParent === '' && 'is-primary')}
                        onClick={() => setSelectedParent('')}>(None)</div>
                    {parentAreas.map((area, i) => renderArea(area, i))}
                    
                </div>
                <div className='tags'>
                    {childrenToDisplay.map((area, i) => renderArea(area, i))}
                </div>
                
                <div className='buttons'>
                    <button type='submit' className='button is-link'>Submit</button>
                    <button className='button' onClick={() => {
                        setExpandForm(false); 
                        setAreaIdToEdit('');
                        }}>Cancel</button>
                </div>
            </>
            }
            
        </form>
    )
}