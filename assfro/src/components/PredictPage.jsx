// import { useState, useContext, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import Papa from 'papaparse';
// import { predict } from '../apis/index';
// import { ModelContext } from '../context/ModelContext';
// import { DataContext } from '../context/DataContext';

// const PredictPage = () => {
//   const { modelId } = useParams();
//   const { models } = useContext(ModelContext);
//   const { dataState, updateData } = useContext(DataContext);
//   const { predictions, targetColumn } = dataState;
//   const [selectedModelId, setSelectedModelId] = useState(modelId);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const navigate = useNavigate();

//   // Set the selected model ID from URL parameters
//   useEffect(() => {
//     if (modelId) {
//       setSelectedModelId(modelId);
//       console.log('Model ID from URL:', modelId);
//     }
//   }, [modelId]);

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;
    
//     if (!selectedModelId) {
//       setError('No model ID available. Please train a model first.');
//       return;
//     }
    
//     setError('');
//     setSuccess('');
//     Papa.parse(file, {
//       header: true,
//       complete: async (result) => {
//         const data = result.data;
//         const columns = Object.keys(data[0] || {});
//         const sessionId = 'e0533047-cea9-4119-85e8-5e90e47db5d1';
//         const target = targetColumn || sessionStorage.getItem(`targetColumn_${sessionId}`) || 'status';
//         const highCardinalityCols = columns.filter(col => {
//           const unique = [...new Set(data.map(row => row[col]))].length;
//           return data.length > 0 && unique > 0.5 * data.length;
//         });
//         const predictData = data.map(row => {
//           const filteredRow = {};
//           columns.forEach(col => {
//             if (col !== target && !highCardinalityCols.includes(col)) {
//               filteredRow[col] = row[col];
//             }
//           });
//           return filteredRow;
//         });
//         try {
//           console.log('Sending prediction request with modelId:', selectedModelId);
//           console.log('Prediction data:', predictData);
//           const response = await predict(selectedModelId, predictData);
//           console.log('Prediction response:', response);
//           updateData({ predictions: response.data, error: '' });
//           setSuccess('Prediction successful!');
//         } catch (err) {
//           console.error('Prediction error:', err);
//           setError(`Prediction failed: ${err.response?.data?.error || err.message}`);
//         }
//       },
//       error: (err) => setError(`Failed to parse CSV: ${err}`),
//     });
//   };

//   return (
//     <div className="mb-6">
//       <h2 className="text-2xl font-semibold mb-2">Predict Page (Model ID: {modelId})</h2>
//       <div className="mb-4">
//         <label className="block">Selected Model</label>
//         {selectedModelId ? (
//           <div className="border p-2 bg-gray-50">
//             Model ID: {selectedModelId}
//           </div>
//         ) : (
//           <div className="text-red-500 mb-2">
//             No model ID available. Please train a model first.
//           </div>
//         )}
//         {selectedModelId && (
//           <button
//             onClick={() => navigate(`/summary/${selectedModelId}`)}
//             className="mt-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
//           >
//             View Summary
//           </button>
//         )}
//       </div>
//       <input 
//         type="file" 
//         accept=".csv" 
//         onChange={handleFileChange} 
//         className="border p-2 mb-2" 
//         disabled={!selectedModelId}
//       />
//       {error && <p className="text-red-500 mb-4">{error}</p>}
//       {success && <p className="text-green-500 mb-4">{success}</p>}
//       {predictions && (
//         <div>
//           <h3 className="text-xl font-semibold mb-2">Prediction Results</h3>
//           <table className="w-full border-collapse border border-gray-300">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="border border-gray-300 p-2">Prediction ID</th>
//                 <th className="border border-gray-300 p-2">Prediction</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td className="border border-gray-300 p-2">{predictions.prediction_id}</td>
//                 <td className="border border-gray-300 p-2">{predictions.predictions.join(', ')}</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PredictPage;

import { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Papa from 'papaparse';
import { predict } from '../apis/index';
import { ModelContext } from '../context/ModelContext';
import { DataContext } from '../context/DataContext';

const PredictPage = () => {
  const { modelId } = useParams();
  const { models } = useContext(ModelContext);
  const { dataState, updateData } = useContext(DataContext);
  const { predictions, targetColumn } = dataState;
  const [selectedModelId, setSelectedModelId] = useState(modelId);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (modelId) {
      setSelectedModelId(modelId);
      console.log('Model ID from URL:', modelId);
    }
  }, [modelId]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!selectedModelId) {
      setError('No model ID available. Please train a model first.');
      return;
    }

    setError('');
    setSuccess('');
    Papa.parse(file, {
      header: true,
      complete: async (result) => {
        const data = result.data;
        const columns = Object.keys(data[0] || {});
        const sessionId = 'e0533047-cea9-4119-85e8-5e90e47db5d1';
        const target = targetColumn || sessionStorage.getItem(`targetColumn_${sessionId}`) || 'status';
        const highCardinalityCols = columns.filter(col => {
          const unique = [...new Set(data.map(row => row[col]))].length;
          return data.length > 0 && unique > 0.5 * data.length;
        });
        const predictData = data.map(row => {
          const filteredRow = {};
          columns.forEach(col => {
            if (col !== target && !highCardinalityCols.includes(col)) {
              filteredRow[col] = row[col];
            }
          });
          return filteredRow;
        });
        try {
          const response = await predict(selectedModelId, predictData);
          updateData({ predictions: response.data, error: '' });
          setSuccess('✅ Prediction successful!');
        } catch (err) {
          setError(`❌ Prediction failed: ${err.response?.data?.error || err.message}`);
        }
      },
      error: (err) => setError(`❌ Failed to parse CSV: ${err}`),
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="bg-gradient-to-r from-indigo-50 via-white to-indigo-100 shadow-xl rounded-2xl p-8 border border-indigo-200">
        <h2 className="text-4xl font-bold text-gray-800 mb-6">📤 Predict with Model</h2>
        <p className="text-md text-gray-600 mb-6">
          Model ID: <span className="text-indigo-600 font-mono">{modelId}</span>
        </p>

        <div className="mb-8">
          <label className="block text-gray-700 font-medium mb-2">Selected Model</label>
          {selectedModelId ? (
            <div className="bg-indigo-50 text-sm border border-indigo-200 rounded-lg p-3 text-gray-700">
              <span className="font-mono">{selectedModelId}</span>
            </div>
          ) : (
            <div className="text-red-600 font-medium">
              No model ID available. Please train a model first.
            </div>
          )}
          {selectedModelId && (
            <button
              onClick={() => navigate(`/summary/${selectedModelId}`)}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow"
            >
              📊 View Summary
            </button>
          )}
        </div>

        <div className="mb-8">
          <label className="block text-gray-700 font-medium mb-2">Upload CSV for Prediction</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full px-4 py-2 text-sm text-gray-800 bg-white border border-gray-300 rounded-lg shadow-sm file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 disabled:opacity-50"
            disabled={!selectedModelId}
          />
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 mb-6 font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-100 border border-green-300 rounded-lg text-green-700 mb-6 font-medium">
            {success}
          </div>
        )}
      </div>

      {predictions && (
        <div className="mt-10 bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-2xl p-6 border border-gray-200">
          <h3 className="text-3xl font-semibold text-gray-800 mb-6">🔮 Prediction Results</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm text-left text-gray-700">
              <thead className="bg-gray-100 uppercase text-xs text-gray-600">
                <tr>
                  <th className="border border-gray-300 p-3">Prediction ID</th>
                  <th className="border border-gray-300 p-3">Predictions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-indigo-50 transition">
                  <td className="border border-gray-300 p-3 font-mono text-indigo-700">
                    {predictions.prediction_id}
                  </td>
                  <td className="border border-gray-300 p-3 text-gray-800">
                    {predictions.predictions.join(', ')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictPage;

