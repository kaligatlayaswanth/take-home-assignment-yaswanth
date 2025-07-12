// import { useState, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Papa from 'papaparse';
// import { uploadFile } from '../apis/index';
// import { DataContext } from '../context/DataContext';
// import { ModelContext } from '../context/ModelContext';

// const ProfilePage = () => {
//   const navigate = useNavigate();
//   const { dataState, updateData, resetData } = useContext(DataContext);
//   const { clearModels } = useContext(ModelContext);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadError, setUploadError] = useState('');

//   const handleFileChange = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     setIsUploading(true);
//     setUploadError('');

//     try {
//       // Clear old data and models when new file is uploaded
//       resetData();
//       clearModels();
      
//       // Upload file to backend
//       const response = await uploadFile(file);
//       const sessionId = response.session_id;
      
//       // Parse CSV for preview
//       Papa.parse(file, {
//         header: true,
//         complete: (result) => {
//           const data = result.data;
//           const columns = Object.keys(data[0] || {});
//           const schemaInfo = columns.map(col => ({
//             name: col,
//             type: typeof data[0][col],
//             unique: [...new Set(data.map(row => row[col]))].length,
//             missing: data.filter(row => !row[col]).length
//           }));
          
//           // Update context with session_id and schema
//           updateData({
//             sessionId: sessionId,
//             csvData: data,
//             schema: schemaInfo,
//             error: ''
//           });
          
//           // Don't navigate automatically - let user navigate manually
//           setIsUploading(false);
//         },
//         error: (err) => {
//           setUploadError(`Failed to parse CSV: ${err}`);
//           setIsUploading(false);
//         }
//       });
//     } catch (error) {
//       setUploadError(`Upload failed: ${error.message}`);
//       setIsUploading(false);
//     }
//   };

//   return (
//     <div className="mb-6">
//       <h2 className="text-2xl font-semibold mb-2">Upload CSV File</h2>
//       <div className="mb-4">
//         <input 
//           type="file" 
//           accept=".csv" 
//           onChange={handleFileChange} 
//           className="border p-2 mb-2" 
//           disabled={isUploading}
//         />
//         {isUploading && <p className="text-blue-500">Uploading...</p>}
//         {uploadError && <p className="text-red-500 mb-4">{uploadError}</p>}
//       </div>
      
//       {dataState.schema && (
//         <div>
//           <h3 className="text-xl font-semibold mb-2">Schema and Profiling</h3>
//           <p className="text-green-600 mb-2">Session ID: {dataState.sessionId}</p>
//           <table>
//             <thead>
//               <tr>
//                 <th>Column</th>
//                 <th>Type</th>
//                 <th>Unique Values</th>
//                 <th>Missing Values</th>
//               </tr>
//             </thead>
//             <tbody>
//               {dataState.schema.map(col => (
//                 <tr key={col.name}>
//                   <td>{col.name}</td>
//                   <td>{col.type}</td>
//                   <td>{col.unique}</td>
//                   <td>{col.missing}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProfilePage;

import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { uploadFile } from '../apis/index';
import { DataContext } from '../context/DataContext';
import { ModelContext } from '../context/ModelContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { dataState, updateData, resetData } = useContext(DataContext);
  const { clearModels } = useContext(ModelContext);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      resetData();
      clearModels();

      const response = await uploadFile(file);
      const sessionId = response.session_id;

      Papa.parse(file, {
        header: true,
        complete: (result) => {
          const data = result.data;
          const columns = Object.keys(data[0] || {});
          const schemaInfo = columns.map(col => ({
            name: col,
            type: typeof data[0][col],
            unique: [...new Set(data.map(row => row[col]))].length,
            missing: data.filter(row => !row[col]).length
          }));

          updateData({
            sessionId: sessionId,
            csvData: data,
            schema: schemaInfo,
            error: ''
          });

          setIsUploading(false);
        },
        error: (err) => {
          setUploadError(`Failed to parse CSV: ${err}`);
          setIsUploading(false);
        }
      });
    } catch (error) {
      setUploadError(`Upload failed: ${error.message}`);
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">📁 Upload CSV File</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full sm:w-auto px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50"
            disabled={isUploading}
          />
          {isUploading && <p className="text-blue-500 font-medium">Uploading...</p>}
        </div>
        {uploadError && <p className="text-red-600 mt-2">{uploadError}</p>}
      </div>

      {dataState.schema && (
        <div className="mt-8">
          <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">🧠 Schema and Profiling</h3>
            <p className="text-sm text-gray-500 mb-4">Session ID: <span className="font-mono text-green-600">{dataState.sessionId}</span></p>

            <div className="overflow-auto rounded-lg">
              <table className="min-w-full text-sm text-left text-gray-700 border border-gray-200">
                <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-600 border-b border-gray-300">
                  <tr>
                    <th className="px-4 py-3">Column</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Unique Values</th>
                    <th className="px-4 py-3">Missing Values</th>
                  </tr>
                </thead>
                <tbody>
                  {dataState.schema.map((col) => (
                    <tr key={col.name} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{col.name}</td>
                      <td className="px-4 py-2 capitalize">{col.type}</td>
                      <td className="px-4 py-2">{col.unique}</td>
                      <td className="px-4 py-2">{col.missing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
