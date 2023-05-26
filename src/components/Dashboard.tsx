import { useContext, Fragment, useState } from 'react';

import { DataContext } from '../App';
import { Area, Data } from '../utilities/interfaces';
import { AreaInfo } from './areas/AreaInfo';
import { AllTime } from './entries/AllTime';





export const Dashboard = () => {
    const { areas } = useContext(DataContext) as Data;
    const hasParent = (area: Area) => area.parent && area.parent !== '';
    const parentAreas = areas.filter((area: Area) => !hasParent(area));
    const childrenOfParent = (parentId: string) => areas.filter((area: Area) => area.parent === parentId);

    const renderArea = (area: Area) => (
        <div className='box dashboard--area'>
            <div className='dashboard--area-info'><AreaInfo selectedAreaId={area._id} compact={true}/></div>
            <div className='dashboard--area-goals'>
                <AllTime areaId={area._id} compact={true} />
            </div>
        </div>
    )

    const RenderAreaSection = (area: Area, i: number) => {
        const [isExpanded, setIsExpanded] = useState<boolean>(false);
        return <div key={i} className='dashboard--section'>
        {renderArea(area)}
        <div className={'button ' + (isExpanded && 'is-primary')} onClick={() => setIsExpanded(isExpanded => !isExpanded)}>
            <span className={'' +(isExpanded && 'pr-1')}>Show Sub-Areas</span>
            {isExpanded && <span className='delete is-small'></span>}
        </div>
        {isExpanded && childrenOfParent.length > 0 && <div className='dashboard--child-area'>{childrenOfParent(area._id).map((area, i) => <Fragment key={i}>{renderArea(area)}</Fragment>)}</div>}
    </div>
    }

    return (
    <div className='dashboard'>
        <h2 className='title is-5'>Dashboard</h2>
        <div>
        {parentAreas.map((area: Area, i) => RenderAreaSection(area, i))}
        </div>
    </div>)
}