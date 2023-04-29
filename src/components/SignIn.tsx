import { useState, useContext } from 'react';

import { UserContext } from '../App';
import { backend } from '../utilities/backend';

export const SignIn = ({ setUserId }: { setUserId: Function }) => {
  const userId = useContext(UserContext);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [signinType, setSigninType] = useState('login');
  const [warning, setWarning] = useState('')

  const postCredentials = async () => {
    const response = await backend.post(`auth/${signinType}`, { 
      username: usernameInput, 
      password: passwordInput 
    })
    if (response.data === 'Invalid username or password' || response.data === 'User already exists') {
      setWarning(response.data);
    }
    else if (response.status === 200) {
      setUserId(response.data);
      setSigninType('login');
      setWarning('');
    }
  }

  return userId
    ? <button className='button is-warning is-light' onClick={() => setUserId('')}>Logout</button>
    : (
    <form className='form control' onSubmit={e => {
      e.preventDefault();
      postCredentials();
      }}>
      <input className='input is-inline mr-2' id='username' type='text' placeholder='username' 
        onChange={(e) => setUsernameInput(e.target.value)} />
      <input className='input is-inline mr-2' id='password' type='password' placeholder='password' 
        onChange={(e) => setPasswordInput(e.target.value)} />
      <div className='buttons is-inline has-addons mr-3'>
        <button 
            className={'button ' + (signinType === 'login' && 'is-primary')}
            onClick={e => {
              e.preventDefault(); 
              setSigninType('login');
              }}>
            Login</button>
        <button 
            className={'button ' + (signinType === 'signup' && 'is-primary')}
            onClick={e => {
              e.preventDefault(); 
              setSigninType('signup');
              }}>
            Sign Up</button>
      </div>
      <button type='submit' className='button'>Submit</button>
      <p>{warning}</p>
    </form>
    );
}