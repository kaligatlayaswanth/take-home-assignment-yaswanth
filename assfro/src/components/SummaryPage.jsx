// import { useEffect, useContext } from 'react';
// import { useParams } from 'react-router-dom';
// import { getSummary } from '../apis/index';
// import { DataContext } from '../context/DataContext';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// const SummaryPage = () => {
//   const { modelId } = useParams();
//   const { dataState, updateData } = useContext(DataContext);
//   const { featureImportance, insights, error } = dataState;

//   useEffect(() => {
//     const fetchSummary = async () => {
//       try {
//         console.log('Fetching summary for model ID:', modelId);
//         const response = await getSummary(modelId);
//         console.log('Summary response:', response);
        
//         // Extract feature importance from insights more robustly
//         const importance = [];
//         response.data.insights.forEach(insight => {
//           // Look for feature importance patterns in the details
//           const importanceMatches = insight.details.match(/(\w+)\s*\(([\d.]+)\)/g);
//           if (importanceMatches) {
//             importanceMatches.forEach(match => {
//               const featureMatch = match.match(/(\w+)\s*\(([\d.]+)\)/);
//               if (featureMatch) {
//                 const feature = featureMatch[1];
//                 const importanceValue = parseFloat(featureMatch[2]);
//                 // Avoid duplicates
//                 if (!importance.find(item => item.feature === feature)) {
//                   importance.push({ feature, importance: importanceValue });
//                 }
//               }
//             });
//           }
//         });
        
//         // If no importance found in insights, try to extract from the first insight
//         if (importance.length === 0 && response.data.insights.length > 0) {
//           const firstInsight = response.data.insights[0].details;
//           const matches = firstInsight.match(/(\w+)\s*\(([\d.]+)\)/g);
//           if (matches) {
//             matches.forEach(match => {
//               const featureMatch = match.match(/(\w+)\s*\(([\d.]+)\)/);
//               if (featureMatch) {
//                 const feature = featureMatch[1];
//                 const importanceValue = parseFloat(featureMatch[2]);
//                 importance.push({ feature, importance: importanceValue });
//               }
//             });
//           }
//         }
        
//         console.log('Extracted feature importance:', importance);
        
//         updateData({
//           insights: response.data.insights,
//           featureImportance: importance,
//           error: ''
//         });
//       } catch (err) {
//         console.error('Summary fetch error:', err);
//         updateData({ error: `Failed to fetch summary: ${err.response?.data?.error || err.message}` });
//       }
//     };
    
//     if (modelId) {
//       fetchSummary();
//     }
//   }, [modelId, updateData]);

//   return (
//     <div className="mb-6">
//       <h2 className="text-2xl font-semibold mb-2">Summary Page (Model ID: {modelId})</h2>
//       {error && <p className="text-red-500 mb-4">{error}</p>}
      
//       {insights.length > 0 && (
//         <div className="mb-6">
//           <h3 className="text-xl font-semibold mb-4">Model Insights</h3>
//           <div className="space-y-4">
//             {insights.map((insight, index) => (
//               <div key={index} className="bg-white p-4 rounded-lg shadow border">
//                 <h4 className="font-semibold text-lg text-blue-600 mb-2">{insight.insight}</h4>
//                 <p className="text-gray-700">{insight.details}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
      
//       {featureImportance.length > 0 && (
//         <div className="mb-6">
//           <h3 className="text-xl font-semibold mb-4">Feature Importance</h3>
//           <div className="bg-white p-4 rounded-lg shadow border">
//             <ResponsiveContainer width="100%" height={400}>
//               <BarChart data={featureImportance}>
//                 <XAxis dataKey="feature" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="importance" fill="#8884d8" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       )}
      
//       {!insights.length && !error && (
//         <div className="text-gray-500 text-center py-8">
//           Loading summary data...
//         </div>
//       )}
//     </div>
//   );
// };

// export default SummaryPage;

import { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getSummary } from '../apis/index';
import { DataContext } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SummaryPage = () => {
  const { modelId } = useParams();
  const { dataState, updateData } = useContext(DataContext);
  const { featureImportance, insights, error } = dataState;

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        console.log('Fetching summary for model ID:', modelId);
        const response = await getSummary(modelId);
        console.log('Summary response:', response);

        const importance = [];
        response.data.insights.forEach(insight => {
          const importanceMatches = insight.details.match(/(\w+)\s*\(([\d.]+)\)/g);
          if (importanceMatches) {
            importanceMatches.forEach(match => {
              const featureMatch = match.match(/(\w+)\s*\(([\d.]+)\)/);
              if (featureMatch) {
                const feature = featureMatch[1];
                const importanceValue = parseFloat(featureMatch[2]);
                if (!importance.find(item => item.feature === feature)) {
                  importance.push({ feature, importance: importanceValue });
                }
              }
            });
          }
        });

        if (importance.length === 0 && response.data.insights.length > 0) {
          const firstInsight = response.data.insights[0].details;
          const matches = firstInsight.match(/(\w+)\s*\(([\d.]+)\)/g);
          if (matches) {
            matches.forEach(match => {
              const featureMatch = match.match(/(\w+)\s*\(([\d.]+)\)/);
              if (featureMatch) {
                const feature = featureMatch[1];
                const importanceValue = parseFloat(featureMatch[2]);
                importance.push({ feature, importance: importanceValue });
              }
            });
          }
        }

        console.log('Extracted feature importance:', importance);

        updateData({
          insights: response.data.insights,
          featureImportance: importance,
          error: ''
        });
      } catch (err) {
        console.error('Summary fetch error:', err);
        updateData({ error: `Failed to fetch summary: ${err.response?.data?.error || err.message}` });
      }
    };

    if (modelId) {
      fetchSummary();
    }
  }, [modelId, updateData]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📈 Model Summary</h2>
        <p className="text-sm text-gray-500 mb-4">Model ID: <span className="text-blue-600 font-mono">{modelId}</span></p>
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {insights.length > 0 && (
        <div className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">💡 Model Insights</h3>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
            {insights.map((insight, index) => (
              <div key={index} className="bg-white p-5 rounded-2xl shadow border border-gray-200">
                <h4 className="text-sky-500 text-lg font-semibold mb-2 text-center">{insight.insight}</h4>
                <p className="text-gray-700 text-sm">{insight.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {featureImportance.length > 0 && (
        <div className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">📊 Feature Importance</h3>
          <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={featureImportance}>
                <XAxis dataKey="feature" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="importance" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!insights.length && !error && (
        <div className="text-gray-500 text-center py-10">
          ⏳ Loading summary data...
        </div>
      )}
    </div>
  );
};

export default SummaryPage;
