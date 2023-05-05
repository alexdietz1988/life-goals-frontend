import axios from 'axios';

export const backend = axios.create({ 
    baseURL: 'https://life-goals-backend.herokuapp.com/'
    // baseURL: 'http://localhost:4000/'
});