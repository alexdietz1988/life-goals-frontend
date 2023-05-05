import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';

import { DataContext } from '../../App';
import { Area, Data } from '../../utilities/interfaces';
import { AreaForm } from './AreaForm';
import { EditableArea } from './EditableArea';

export const ManageAreas = () => {
    const { areas } = useContext(DataContext) as Data;
    const [areaIdToEdit, setAreaIdToEdit] = useState('');
    const hasParent = (area: Area) => area.parent && area.parent !== '';
    const parentAreas = areas.filter((area: Area) => !hasParent(area));
    const childrenOfParent = (parentId: string) => areas.filter((area: Area) => area.parent === parentId);

    const renderArea = (area: Area) => 
        <div>
        {(areaIdToEdit === area._id
            ? <AreaForm area={area} setAreaIdToEdit={setAreaIdToEdit}/>
            : <EditableArea area={area} setAreaIdToEdit={setAreaIdToEdit} />)}
        </div>;

    return (
    <div className='manage-areas box'>
        <div><Link to='/'>{`←`} Back</Link></div>
        <h2 className='title is-5'>Manage Areas</h2>
        <div className='areas-list'>
        {parentAreas.map((area: Area, i) => 
        <div key={i} className='family'>
            <div className='parent area'>
                {renderArea(area)}
            </div>
            {childrenOfParent(area._id).map((area, i) => 
            <div key={i} className='child area'>     
                {renderArea(area)}
            </div>
            )}
        </div>
        )}
        </div>
        <AreaForm setAreaIdToEdit={setAreaIdToEdit}/>
    </div>)
}