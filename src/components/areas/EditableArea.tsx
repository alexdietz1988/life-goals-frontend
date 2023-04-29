import { useContext } from 'react';

import { SettingsContext } from '../../App';
import { Area, Settings } from '../../utilities/interfaces';
import { backend } from '../../utilities/backend';

interface EditableAreaProps {
    area: Area,
    setAreaIdToEdit: Function,
}

export const EditableArea = ({ area, setAreaIdToEdit }: EditableAreaProps ) => {
    const { setLoading } = useContext(SettingsContext) as Settings;
    const deleteArea = async (itemId: string) => {
        await backend.delete('area', { data: { itemId } });
        setLoading(true);
      }
    return (
        <div className='editable-area'>
            <h3 className='mr-4 area-label'>{area.label}</h3>
            <span className='edit-icon icon mx-2'
                onClick={() => setAreaIdToEdit(area._id)}>
                <i className='fas fa-pen-to-square' />
            </span>
            <button
                className='delete is-small'
                onClick={() => deleteArea(area._id)} />
        </div>
    )
}