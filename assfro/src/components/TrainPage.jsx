// import { useState, useContext } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { trainModel } from '../apis/index';
// import { DataContext } from '../context/DataContext';
// import { ModelContext } from '../context/ModelContext';

// const TrainPage = () => {
//   const { sessionId } = useParams();
//   const navigate = useNavigate();
//   const { dataState, updateData } = useContext(DataContext);
//   const { addModel } = useContext(ModelContext);
//   const [targetColumn, setTargetColumn] = useState('');
//   const [isTraining, setIsTraining] = useState(false);
//   const [trainingError, setTrainingError] = useState('');

//   const handleTraining = async () => {
//     if (!targetColumn) {
//       setTrainingError('Please select a target column.');
//       return;
//     }
    
//     if (!dataState.csvData || !dataState.csvData.length) {
//       setTrainingError('No CSV data found. Please upload a CSV file first.');
//       return;
//     }
    
//     setIsTraining(true);
//     setTrainingError('');

//     try {
//       const response = await trainModel(sessionId, targetColumn);
//       const modelId = response.data.model_id;
      
//       // Add model to ModelContext
//       addModel(modelId, `Model for ${targetColumn}`);
      
//       // Update context with model_id and metrics
//       updateData({
//         modelId: modelId,
//         metrics: response.data.metrics,
//         targetColumn: targetColumn,
//         error: ''
//       });
      
//       // Don't navigate automatically - let user navigate manually
//       setIsTraining(false);
//     } catch (err) {
//       setTrainingError(`Training failed: ${err.response?.data?.error || err.message}`);
//     } finally {
//       setIsTraining(false);
//     }
//   };

//   return (
//     <div className="mb-6">
//       <h2 className="text-2xl font-semibold mb-2">Train Model (Session ID: {sessionId})</h2>
      
//       {dataState.schema && (
//         <div className="mb-4">
//           <h3 className="text-lg font-semibold mb-2">Available Columns</h3>
//           <select
//             value={targetColumn}
//             onChange={(e) => setTargetColumn(e.target.value)}
//             className="border p-2 w-full"
//           >
//             <option value="">Select target column...</option>
//             {dataState.schema.map(col => (
//               <option key={col.name} value={col.name}>
//                 {col.name} ({col.type})
//               </option>
//             ))}
//           </select>
//         </div>
//       )}
      
//       <button 
//         onClick={handleTraining} 
//         disabled={isTraining || !targetColumn}
//         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
//       >
//         {isTraining ? 'Training...' : 'Train Model'}
//       </button>
      
//       {trainingError && <p className="text-red-500 mt-4">{trainingError}</p>}
      
//       {dataState.metrics && (
//         <div className="mt-4">
//           <h3 className="text-xl font-semibold">Training Results</h3>
//           <p className="text-green-600">Model ID: {dataState.modelId}</p>
//           <h4 className="text-lg font-semibold mt-2">Evaluation Metrics</h4>
//           <ul>
//             {Object.entries(dataState.metrics).map(([key, value]) => (
//               <li key={key}>{key}: {typeof value === 'number' ? value.toFixed(3) : value}</li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TrainPage;

import { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trainModel } from '../apis/index';
import { DataContext } from '../context/DataContext';
import { ModelContext } from '../context/ModelContext';

const TrainPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { dataState, updateData } = useContext(DataContext);
  const { addModel } = useContext(ModelContext);
  const [targetColumn, setTargetColumn] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingError, setTrainingError] = useState('');

  const handleTraining = async () => {
    if (!targetColumn) {
      setTrainingError('Please select a target column.');
      return;
    }

    if (!dataState.csvData || !dataState.csvData.length) {
      setTrainingError('No CSV data found. Please upload a CSV file first.');
      return;
    }

    setIsTraining(true);
    setTrainingError('');

    try {
      const response = await trainModel(sessionId, targetColumn);
      const modelId = response.data.model_id;

      addModel(modelId, `Model for ${targetColumn}`);

      updateData({
        modelId: modelId,
        metrics: response.data.metrics,
        targetColumn: targetColumn,
        error: ''
      });

      setIsTraining(false);
    } catch (err) {
      setTrainingError(`Training failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          🧪 Train Model
        </h2>
        <p className="text-sm text-gray-500 mb-4">Session ID: <span className="font-mono text-blue-600">{sessionId}</span></p>

        {dataState.schema && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Select Target Column</h3>
            <select
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select target column --</option>
              {dataState.schema.map(col => (
                <option key={col.name} value={col.name}>
                  {col.name} ({col.type})
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={handleTraining}
          disabled={isTraining || !targetColumn}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isTraining ? 'Training...' : '🚀 Train Model'}
        </button>

        {trainingError && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {trainingError}
          </div>
        )}
      </div>

      {dataState.metrics && (
        <div className="mt-8 bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">📊 Training Results</h3>
          <p className="text-sm text-green-600 mb-4">Model ID: <span className="font-mono">{dataState.modelId}</span></p>
          <div className="space-y-2">
            <h4 className="text-lg font-medium text-gray-700 mb-1">Evaluation Metrics:</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(dataState.metrics).map(([key, value]) => (
                <li key={key} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <span className="font-medium text-gray-600">{key}:</span>{' '}
                  <span className="text-gray-900">{typeof value === 'number' ? value.toFixed(3) : value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainPage;
