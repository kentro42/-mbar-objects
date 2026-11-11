import React from 'react';
import { createRoot } from 'react-dom/client';
import AlbumApp from './app/AlbumApp.jsx';
import './styles/album.css';

createRoot(document.getElementById('root')).render(<AlbumApp />);
