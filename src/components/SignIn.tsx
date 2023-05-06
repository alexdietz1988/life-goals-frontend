import { useState, useContext, useRef } from 'react';

import { UserContext, SettingsContext } from '../App';
import { backend } from '../utilities/backend';
import { UserContextInterface, Settings } from '../utilities/interfaces';

export const SignIn = () => {
  const { setUserId } = useContext(UserContext) as UserContextInterface;
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const [warning, setWarning] = useState('')

  const postCredentials = async (signinType: 'login' | 'signup') => {
    const response = await backend.post(`auth/${signinType}`, { 
      username: usernameInputRef.current?.value, 
      password: passwordInputRef.current?.value 
    })
    if (response.data === 'Invalid username or password' || response.data === 'User already exists') {
      setWarning(response.data);
    }
    else if (response.status === 200) {
      setUserId(response.data);
      setWarning('');
    }
  }

  return (
    <div className='sign-in'>
      <input className='input' ref={usernameInputRef} id='username' type='text' placeholder='username' />
      <input className='input' ref={passwordInputRef} id='password' type='password' placeholder='password' />
      <div className='buttons'>
        <div 
            className='button is-link'
            onClick={() => postCredentials('login')}>
            Login</div>
        <div 
            className='button'
            onClick={e => postCredentials('signup')}>
            Sign Up</div>
      </div>
      <p>{warning}</p>
    </div>
  )
}