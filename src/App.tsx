import { Route, Routes, useNavigate } from 'react-router-dom';
import { useState, useEffect, createContext } from 'react';

import './styles/App.scss';
import './styles/Header.scss';
import './styles/Areas.scss';
import './styles/Entries.scss';
import './styles/EntryForm.scss';
import './styles/AreaForm.scss';
import './styles/AllTime.scss';
import { backend } from './utilities/utils';
import { Area } from './utilities/interfaces';

import { Header } from './components/Header';
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
  const [defaultTimes, setDefaultTimes] = useState(false);
  const navigate = useNavigate();

  const [areas, setAreas] = useState([] as Array<Area>);
  const [selectedAreaId, setSelectedAreaId] = useState('');

  const fetchAreas = async () => {
    const areasResponse = await backend.get('area', { params: { userId } });
    setAreas(areasResponse.data);
  }

  useEffect(() => {
    if (userId) fetchAreas()
  }, [userId])

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
    <UserContext.Provider value={{ userId, setUserId }}>
    <DataContext.Provider value={{ areas, selectedAreaId }}>
    <SettingsContext.Provider value={{ fetchAreas, setDefaultTimes }}>
    <Header />
    <main>
      {!userId && <SignIn />}
      {userId && (
      <>
      <Routes>
        <Route path='/' element={<PageWrapper children={
          <FocusView defaultTimes={defaultTimes} setDefaultTimes={setDefaultTimes} />} />} />
        <Route path='/all-time' element={<PageWrapper children={<AllTime/>} />} />
        <Route path='/manage-areas' element={<ManageAreas />} />
        <Route path='/new-goal' element={<EntryForm selectedType='goal' dismissForm={() => navigate(-1) } />} />
        <Route path='/new-note' element={<EntryForm selectedType='note' dismissForm={() => navigate(-1) }/>} />
      </Routes>
    </>)
      }
    </main>
    <footer className='footer is-small'><strong>Life Goals</strong> by <a target='_blank' rel='noreferrer' href="http://alexdietz.com">Alex Dietz</a></footer>
    </SettingsContext.Provider>
    </DataContext.Provider>
    </UserContext.Provider>
    </>
  );
}

export default App;
