import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';

import { UserContext, SettingsContext } from '../App';
import { Settings, UserContextInterface } from '../utilities/interfaces';

export const Header = () => {
    const { userId, setUserId } = useContext(UserContext) as UserContextInterface;
    const { setDefaultTimes } = useContext(SettingsContext) as Settings;
    const path = useLocation().pathname;

    if (!userId) return (
        <header>
            <nav className='navbar'>
                <div className='navbar-brand'>
                    <div className='navbar-item'><Link to='/' className='title is-5'>Life Goals</Link></div>
                </div>
            </nav>
        </header>
    )

    return (
        <header>
            <div className='banner mobile-only columns'>
                <div className='column' />
                <Link to='/' className='title-mobile column'>Life Goals</Link>
                <div className='logout-mobile column'>
                    <button className='button is-warning is-light' onClick={() => setUserId('')}>
                        <span className='fas fa-right-from-bracket' />
                    </button>
                </div>
            </div>

            <nav className='mobile-only'>
                <div className='navbar-item button'><Link to='/' onClick={() => setDefaultTimes(true)}>Now</Link></div>
                <div className='navbar-item new-entry-buttons'>
                    <Link to={path === '/new-goal' ? '/' : '/new-goal'} className='button is-primary new-entry-button mr-1'>+</Link>
                    <Link to={path === '/new-note' ? '/' : '/new-note'} className='button is-warning new-entry-button'>
                        <span className='icon'><i className='fa-regular fa-note-sticky' /></span>
                    </Link>
                </div>
                <div className='navbar-item button'><Link to='/all-time'>All Time</Link></div>
            </nav>

            <nav className='desktop-only'>
                <div className='navbar-brand'>
                    <div className='navbar-item'><Link to='/' className='title-desktop'>Life Goals</Link></div>
                    <div className='navbar-item'><Link to='/' onClick={() => setDefaultTimes(true)}>Now</Link></div>
                    <div className='navbar-item'><Link to='/all-time' className=''>All Time</Link></div>
                    <div className='navbar-item new-entry-button'>
                        <Link to={path === '/new-goal' ? '/' : '/new-goal'} className='button is-primary'>
                            +
                        </Link>
                    </div>
                    <div className='navbar-item new-entry-button'>
                        <Link to={path === '/new-note' ? '/' : '/new-note'} className='button is-warning'>
                            <span className='icon'><i className='fa-regular fa-note-sticky' /></span>
                        </Link>
                    </div>
                </div>
                <div className='logout'>
                    <button className='button is-warning is-light' onClick={() => setUserId('')}>
                        <span className='mr-2'>Logout</span>
                        <span className='fas fa-right-from-bracket' />
                    </button>
                </div>
            </nav>
            
        </header>
    )
}