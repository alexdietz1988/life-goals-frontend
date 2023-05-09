import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import { DataContext } from '../../App';
import { AreaInfo } from './AreaInfo';
import { AreaForm } from './AreaForm';
import { Area, Data } from '../../utilities/interfaces';

export const Areas = ({ selectedAreaId, setSelectedAreaId }: { selectedAreaId: string, setSelectedAreaId: Function}) => {
    const [showAreaForm, setShowAreaForm] = useState(false);
    const areas = (useContext(DataContext) as Data).areas;

    const hasParent = (area: Area) => area.parent && area.parent !== '';
    const parentAreas = areas.filter((area: Area) => !hasParent(area));

    const siblingIsSelected = (area: Area) => {
        const siblingIds = areas.filter(a => a.parent === area.parent).map(a => a._id);
        return (siblingIds.some(id => selectedAreaId === id));
    }

    const childrenToDisplay = areas.filter(area => hasParent(area) && 
        (area.parent === selectedAreaId || area._id === selectedAreaId || siblingIsSelected(area)));

    return (
        <div className='container'>
            <div className='areas-tags'>
                <div className='parent-areas'>
                    <div className='tags are-medium hoverable'>
                    {areas.length > 0 && <Link to='/manage-areas' className='manage-button tag is-link is-light'>
                        <span className='icon'><i className='fas fa-cog'></i></span>
                    </Link>}
                    <div className='tag is-info is-light' onClick={() => setShowAreaForm(showAreaForm => !showAreaForm)}>+</div>
                    </div>
                    {parentAreas.map((area: Area, i) =>
                    <div key={i} 
                        className={'tag is-medium hoverable ' + (selectedAreaId === area._id && 'is-primary')}
                        onClick={() => setSelectedAreaId(selectedAreaId === area._id ? '' : area._id)}>{area.label}
                    </div>
                    )}
                </div>
                {childrenToDisplay.length > 0 &&
                <div className='child-areas'>
                    {childrenToDisplay.map((area: Area, i) =>
                    <div key={i}
                        className={'tag is-medium hoverable ' + (selectedAreaId === area._id && 'is-primary')}
                        onClick={() => setSelectedAreaId(selectedAreaId === area._id ? '' : area._id)}>{area.label}</div>
                    )}
                </div>}
                {showAreaForm && <AreaForm dismissForm={() => setShowAreaForm(false)}/>}
            </div>
            {selectedAreaId && <AreaInfo selectedAreaId={selectedAreaId} />}
        </div>
    )
}