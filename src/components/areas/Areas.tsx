import { useContext } from 'react';
import { Link } from 'react-router-dom';

import './Areas.scss';
import { DataContext } from '../../App';
import { AreaInfo } from './AreaInfo';
import { Area, Data } from '../../utilities/interfaces';

export const Areas = ({ selectedAreaId, setSelectedAreaId }: { selectedAreaId: string, setSelectedAreaId: Function}) => {
    const areas = (useContext(DataContext) as Data).areas;

    const hasParent = (area: Area) => area.parent && area.parent !== '';
    const parentAreas = areas.filter((area: Area) => !hasParent(area));
    const childrenToDisplay = areas.filter((area: Area) => hasParent(area) && (area.parent === selectedAreaId || area._id === selectedAreaId));

    return (
        <div className='container'>
            <div className='areas-tags'>
                <div>
                    <Link to='/manage-areas' className='tag is-medium is-link is-light hoverable'>
                        {areas.length > 0 ? 'Manage' : 'Add a New Life Area'}
                    </Link>
                    {parentAreas.map((area: Area, i) =>
                    <div key={i} 
                        className={'tag is-medium hoverable ' + (selectedAreaId === area._id && 'is-primary')}
                        onClick={() => setSelectedAreaId(selectedAreaId === area._id ? '' : area._id)}>{area.label}
                    </div>
                    )}
                </div>
                {childrenToDisplay.length > 0 &&
                <div>
                    {childrenToDisplay.map((area: Area, i) =>
                    <div key={i}
                        className={'tag is-medium hoverable ' + (selectedAreaId === area._id && 'is-primary')}
                        onClick={() => setSelectedAreaId(selectedAreaId === area._id ? '' : area._id)}>{area.label}</div>
                    )}
                </div>}
            </div>
            {selectedAreaId && <AreaInfo selectedAreaId={selectedAreaId} />}

            

        </div>
    )
}