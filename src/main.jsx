import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './router/AppRouter.jsx';
import '../css/styles.css';

createRoot(document.getElementById('root')).render(<AppRouter />);
