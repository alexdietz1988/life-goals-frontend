import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { useState, useEffect, createContext } from 'react';

import './App.scss';
import { backend } from './utilities/backend';
import { Entry, Area } from './utilities/interfaces';

import { SignIn } from './components/SignIn';
import { Areas } from './components/areas/Areas';
import { ManageAreas } from './components/areas/ManageAreas';
import { EntryForm } from './components/entries/EntryForm';
import { AllTime } from './components/entries/AllTime';
import { FocusView } from'./components/entries/FocusView';

export const UserContext = createContext({});
export const DataContext = createContext({});
export const SettingsContext = createContext({});

function App() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [defaultTimes, setDefaultTimes] = useState(false);
  const path = useLocation().pathname;

  const [entries, setEntries] = useState([] as Array<Entry>);
  const [areas, setAreas] = useState([] as Array<Area>);
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const entriesInSelectedArea = entries.filter(entry => {
    const idsOfchildrenOfSelectedArea = areas.filter(area => area.parent === selectedAreaId).map(area => area._id);
    const isInChildOfSelectedArea = entry.areaId && idsOfchildrenOfSelectedArea.includes(entry.areaId);
    return !selectedAreaId || (entry.areaId && entry.areaId.includes(selectedAreaId) || isInChildOfSelectedArea)});

  const getData = async () => {
    const entriesResponse = await backend.get('entry', { params: { userId } });
    setEntries(entriesResponse.data);
    const areasResponse = await backend.get('area', { params: { userId } });
    setAreas(areasResponse.data);
    setLoading(false);
  }

  useEffect(() => {
    getData();
  }, [userId, loading])

  const PageWrapper = ({ children }: { children: any }) => {
    return (
      <>
      <div className='page-wrapper'>
        <Areas selectedAreaId={selectedAreaId} setSelectedAreaId={setSelectedAreaId} />
      </div>
      {children}
      </>
    )
  }

  return (
    <>
    <UserContext.Provider value={userId}>
    <DataContext.Provider value={{areas, entries: entriesInSelectedArea}}>
    <SettingsContext.Provider value={{setLoading}}>
    <header>
      <nav className='navbar'>
        <div className='navbar-brand'>
          <div className='navbar-item'><Link to='/' className='title is-5'>Life Goals</Link></div>
          {userId && 
          <>
            <div className='navbar-item'><Link to='/' onClick={() => setDefaultTimes(true)}>Now</Link></div>
            <div className='navbar-item'><Link to='/all-time'>All Time</Link></div>

            <div className='navbar-item'><Link to={path === '/new-goal' ? '/' : '/new-goal'} className='button'>+ Goal</Link></div>
            <div className='navbar-item'><Link to={path === '/new-note' ? '/' : '/new-note'} className='button'>+ Note</Link></div>
            <div className='navbar-item'><SignIn setUserId={setUserId} /></div>
          </>}
        </div>
      </nav>
    </header>
    <main>
      {!userId && <SignIn setUserId={setUserId} />}
      {userId && (
      <>
      <Routes>
        <Route path='/all-time' element={<PageWrapper children={<AllTime/>} />} />
        <Route path='/' element={<PageWrapper children={
          <FocusView defaultTimes={defaultTimes} setDefaultTimes={setDefaultTimes} />} />} />
        <Route path='/manage-areas' element={<ManageAreas />} />
        <Route path='/new-goal' element={<EntryForm selectedType='goal' pageVersion />} />
        <Route path='/new-note' element={<EntryForm selectedType='note' pageVersion />} />
      </Routes>
    </>)
      }
    </main>
    <footer className='footer is-small'><strong>Life Goals</strong> by <a target='_blank' href="http://alexdietz.com">Alex Dietz</a></footer>
    </SettingsContext.Provider>
    </DataContext.Provider>
    </UserContext.Provider>
    </>
  );
}

export default App;
