import React, { createContext, useContext, useEffect, useReducer } from 'react';
import Cookies from 'js-cookie'
import isEmpty from 'lodash.isempty';

import api from '../../lib/api';

type AuthState = {
  jwt: string,
  user: any,
  loggedIn: boolean
}

type AuthAction =
  | { type: 'login', payload: any }
  | { type: 'logout' }

const defaultState = {
  jwt: null,
  user: {},
  loggedIn: false
};

const reducer = async (state: AuthState, action: AuthAction): Promise<AuthState> => {
  console.log('reducer called')
  switch (action.type) {
    case 'login':
      const { jwt = null, user = {} } = action.payload;
      return { ...state, jwt, user, loggedIn: true }
    case 'logout':
      return { ...state, jwt: null, user: {}, loggedIn: false }
    default:
      return defaultState;
  }
}

//TODO fix typescript error
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, action] = useReducer(reducer, defaultState);
  useEffect(() => {

  }, []);
  
  return (
    <AuthContext.Provider value={[state, action]} >
      {children}
    </AuthContext.Provider>
  )
}


export const wrapRootElement = ({ element }) => (
  <AuthProvider>
    {element}
  </AuthProvider>
);

const useAuth = () => {
  const [state, dispatcher] = useContext(AuthContext);

  const token = Cookies.get('token');
  const isAuthenticated = state.loggedIn && !isEmpty(token);

  const loadUserFromCookies = async () =>{
    const token = Cookies.get('token')
    if (token) {
      console.log("Got a token in the cookies, let's see if it is valid")
      api.defaults.headers.Authorization = `Bearer ${token}`
      const { data: payload } = await api.get('users/me')
      console.log('USER', payload);
      dispatcher({type: 'cookie',payload})
    }
    // setLoading(false)
  }

  const login = async (credentials) => new Promise(async (resolve, reject) => {
    try {
      const { data: payload } = await api.post('/auth/local', credentials);
      const { jwt: token } = payload;
      const { user } = payload;
      Cookies.set('token', token, { expires: 60 });
      Cookies.set('user', token, { expires: 60 });
      api.defaults.headers.Authorization = `Bearer ${token}`;
      dispatcher({ type: 'login', payload })
      resolve(payload)
    }
    catch (e) {
      console.log(e)
      reject(e)
    }
  });
  
  const logout = () => {
    Cookies.remove('token');
    dispatcher({ type: 'logout' })
  }

  return {
    state,
    isAuthenticated,
    login,
    logout
  }
}

export default useAuth;