import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './axiosInterceptor'; // attach JWT error handling

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
