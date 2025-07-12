// import { Routes, Route, NavLink } from 'react-router-dom';
// import ProfilePage from './components/ProfilePage';
// import TrainPage from './components/TrainPage';
// import PredictPage from './components/PredictPage';
// import SummaryPage from './components/SummaryPage';

// const App = () => {
//   const defaultSessionId = 'e0533047-cea9-4119-85e8-5e90e47db5d1';

//   return (
//     <div className="container mx-auto p-4">
//       <nav className="mb-6">
//         <NavLink to={`/profile/${defaultSessionId}`} className="mr-4">Profile</NavLink>
//         <NavLink to={`/train/${defaultSessionId}`} className="mr-4">Train</NavLink>
//         <NavLink to="/predict" className="mr-4">Predict</NavLink>
//         <NavLink to="/summary">Summary</NavLink>
//       </nav>
//       <h1 className="text-3xl font-bold mb-6">Project Status Dashboard</h1>
//       <Routes>
//         <Route path="/profile/:sessionId" element={<ProfilePage />} />
//         <Route path="/train/:sessionId" element={<TrainPage />} />
//         <Route path="/predict" element={<PredictPage />} />
//         <Route path="/summary" element={<SummaryPage />} />
//         <Route path="/summary/:modelId" element={<SummaryPage />} />
//       </Routes>
//     </div>
//   );
// };

// export default App;

import { Routes, Route, NavLink } from 'react-router-dom';
import { useContext } from 'react';
import ProfilePage from './components/ProfilePage';
import TrainPage from './components/TrainPage';
import PredictPage from './components/PredictPage';
import SummaryPage from './components/SummaryPage';
import { DataContext } from './context/DataContext';

const App = () => {
  const { dataState } = useContext(DataContext);
  const { sessionId, modelId } = dataState;

  return (
    <div className="container mx-auto p-4">
      <nav className="mb-6">
        <NavLink to="/" className="mr-4">Home (Upload)</NavLink>
        <NavLink to={`/train/${sessionId || 'default'}`} className="mr-4">Train</NavLink>
        <NavLink to={`/predict/${modelId || 'default'}`} className="mr-4">Predict</NavLink>
        <NavLink to={`/summary/${modelId || 'default'}`} className="mr-4">Summary</NavLink>
      </nav>
      <h1 className="text-3xl font-bold mb-6">Project Status Dashboard</h1>
      <Routes>
        <Route path="/" element={<ProfilePage />} />
        <Route path="/train/:sessionId" element={<TrainPage />} />
        <Route path="/predict/:modelId" element={<PredictPage />} />
        <Route path="/summary/:modelId" element={<SummaryPage />} />
      </Routes>
    </div>
  );
};

export default App;