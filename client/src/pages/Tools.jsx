import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const Tools = () => {
  const { courseId, moduleId, unitId, toolGroupId } = useParams();
  const [selectedTool, setSelectedTool] = useState(null);
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tools, setTools] = useState(null);
  const [toolGroup, setToolGroup] = useState(null);
  const [progress, setProgress] = useState(0); // Track loading progress
  const [modelVisible, setModelVisible] = useState(true); // Track model visibility

  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true
  });

  // Fetch tool group data from the backend API
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await axiosInstance.get(`/content/tools/${toolGroupId}`);
        if (response.data.tools && response.data.tools.length > 0) {
          setTools(response.data.tools);
          setToolGroup(response.data.toolGroup);
          setUnit(response.data.unit.title);
        } else {
          console.error('No tools found in the response');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tool group:', error);
        setLoading(false);
      }
    };
    fetchTools();
  }, [toolGroupId]);

  useEffect(() => {
    if (tools && tools.length > 0) {
      setSelectedTool(tools[0]);
    }
  }, [tools]);

  // Handle tool change when selecting from dropdown
  const handleToolChange = (event) => {
    const toolId = event.target.value;
    const tool = tools.find(tool => tool._id.toString() === toolId);
    setSelectedTool(tool);
  };

  // Handle tool click
  const handleToolClick = (tool) => {
    setSelectedTool(tool);
  };

  // Handle progress event
  useEffect(() => {
    const modelViewer = document.querySelector('model-viewer');
    if (modelViewer) {
      const updateProgress = (event) => {
        const progressValue = event.detail.totalProgress * 100;
        setProgress(progressValue);

        // Show the model after the progress is complete
        if (progressValue === 100) {
          setTimeout(() => {
            setModelVisible(true);
          }, 500); // Adjust delay as needed (500ms here)
        }
      };

      modelViewer.addEventListener('progress', updateProgress);

      return () => {
        modelViewer.removeEventListener('progress', updateProgress); // Clean up
      };
    }
  }, [selectedTool]);

  if (loading) {
    return (
      <div className="min-h-screen inset-0 flex items-center justify-center">
        <p className="text-gray-700 text-2xl font-sf-bold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-xl px-8 py-8 mt-8 sm:mb-48 mb-16">
      <div className="flex flex-wrap text-lg font-sf-bold text-gray-500">
        <Link to={`/lessons/${courseId}/${moduleId}/${unitId}`}>
          <p className="mr-2 mb-2 underline">Return to lessons</p>
        </Link>
      </div>
      <h1 className="text-5xl font-sf-bold text-gray-900">{toolGroup.title}</h1>

      <div className="flex flex-col sm:flex-row sm:mt-24 mt-16">
        <div className="w-full sm:w-1/3 mb-4 sm:mr-4 sm:h-96 overflow-auto">
          <h2 className="text-base font-sf-bold text-gray-500 mb-2">Select to view:</h2>
          <div className="hidden bg-[#F1F1F1] p-4 sm:block">
            {tools.map(tool => (
              <button 
                key={tool._id}
                onClick={() => handleToolClick(tool)}
                className={`text-sm w-full mb-2 p-2 border bg-white rounded-md text-left text-gray-700 font-sf-regular shadow-lg ${selectedTool && selectedTool._id === tool._id ? 'border-blue-500 bg-[#DEF1FF] text-[#125DCD]' : 'border-gray-400'}`}
              >
                {tool.name}
              </button>
            ))}
          </div>
          <div className="sm:hidden">
            <select
              onChange={handleToolChange}
              className="w-full p-2 border border-gray-300 rounded-md text-gray-700 font-sf-regular"
              value={selectedTool ? selectedTool._id : ""}
            >
              {tools.map(tool => (
                <option key={tool._id} value={tool._id}>
                  {tool.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full sm:w-[1000px] flex flex-col justify-center items-center">
          <div className="w-full h-[70vh] bg-gray-100 flex justify-center items-center mb-2 sm:mb-0 relative">
            {selectedTool ? (
              selectedTool.modelPath ? (
                <>
                  {modelVisible ? ( // Only show the model when it's visible
                    <model-viewer
                      key={selectedTool.modelPath}
                      src={selectedTool.modelPath}
                      ar
                      ar-modes="scene-viewer webxr quick-look"
                      ar-placement="floor"
                      camera-controls
                      tone-mapping="neutral"
                      poster="poster.webp"
                      shadow-intensity="1"
                      style={{ width: '100%', height: '100%', flexGrow: 1 }}
                    >
                      <button
                        slot="ar-button"
                        id="ar-button"
                        className="absolute bottom-4 left-0 right-0 mx-auto bg-[#125DCD] text-white p-2 rounded-md w-56 font-sf-regular text-sm"
                      >
                        View in your space
                      </button>
                    </model-viewer>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-64 h-4 bg-gray-200 rounded-full overflow-hidden">
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-gray-700 font-sf-regular">3D model of {selectedTool.name} not yet available</div>
              )
            ) : (
              <div className="text-center text-gray-700 font-sf-regular">No tool selected</div>
            )}
          </div>
        </div>

        <div className='w-full sm:w-1/3 sm:ml-6 mt-8'>
          <h3 className="text-3xl font-sf-bold text-gray-800 mb-2">{selectedTool?.name}</h3>
          <div className="sm:mt-6">
            <p className="text-gray-600 font-sf-regular text-sm">
              {selectedTool && selectedTool.description ? selectedTool.description : "No description yet."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tools;
