// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import { BrowserRouter } from 'react-router-dom'
// import { ModelProvider } from './context/ModelContext'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <BrowserRouter>
//       <ModelProvider>
//         <App />
//       </ModelProvider>
//     </BrowserRouter>
//   </StrictMode>,
// )

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ModelProvider } from './context/ModelContext.jsx';
import { DataProvider } from './context/DataContext.jsx';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ModelProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </ModelProvider>
    </BrowserRouter>
  </React.StrictMode>
);
