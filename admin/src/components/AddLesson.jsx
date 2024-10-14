import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AddLesson = ({ activeTab, showModal, setShowModal, fetchContent }) => {
  const [formData, setFormData] = useState({ 
    title: '', 
    image:'', 
    courseSectionId: '', 
    courseId: '', 
    moduleId: '', 
    unitId: '', 
    toolGroupId: '', 
    practicalSimulation: '',
    name: '',
    description: '',
    modelPath: ''
  });
  const [courseSections, setCourseSections] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [allModules, setAllModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [allUnits, setAllUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [allToolGroups, setAllToolGroups] = useState([]);
  const [filteredToolGroups, setFilteredToolGroups] = useState([]);
  const [formError, setFormError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  const [urlError, setUrlError] = useState(false);
  const [fileError, setFileError] = useState(false);
  const [fileNumberError, setFileNumberError] = useState(false)
  const imageInput = useRef(null)
  const objectInput = useRef(null)

  const axiosInstance = axios.create({
    baseURL:process.env.REACT_APP_API_URL,
    withCredentials: true
  });

  useEffect(() => {
    async function fetchOptions() {
      try {
        const courseSectionsResponse = await axiosInstance.get('/contentManagement/getAllCourseSections');
        const nonArchivedSections = courseSectionsResponse.data.courseSections.filter(section => !section.archived);
        setCourseSections(nonArchivedSections);

        const coursesResponse = await axiosInstance.get('/contentManagement/getAllCourses');
        const nonArchivedCourses = coursesResponse.data.courses.filter(course => !course.archived);
        setAllCourses(nonArchivedCourses);

        const modulesResponse = await axiosInstance.get('/contentManagement/getAllModules');
        const nonArchivedModules = modulesResponse.data.modules.filter(module => !module.archived);
        setAllModules(nonArchivedModules);

        const unitsResponse = await axiosInstance.get('/contentManagement/getAllUnits');
        const nonArchivedUnits = unitsResponse.data.units.filter(unit => !unit.archived);
        setAllUnits(nonArchivedUnits);

        const toolGroupsResponse = await axiosInstance.get('/lessonManagement/getAllToolGroups');
        const nonArchivedToolGroups = toolGroupsResponse.data.toolGroups.filter(toolGroup => !toolGroup.archived);
        setAllToolGroups(nonArchivedToolGroups);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    if (showModal) {
      fetchOptions();
    }
  }, [showModal, activeTab]);

  useEffect(() => {
    if (formData.courseSectionId) {
      const newFilteredCourses = allCourses.filter(course => course.courseSectionId._id === formData.courseSectionId);
      setFilteredCourses(newFilteredCourses);
      setFilteredModules([]); // Reset modules when course section changes
      setFilteredUnits([]);
      setFilteredToolGroups([]);

      setFormData(prevData => ({
        ...prevData,
        courseId: '',
        moduleId: '',
        unitId: '',
        toolGroupId: '',
      }));
    } else {
      setFilteredCourses([]);
      setFormData(prevData => ({
        ...prevData,
        courseId: '',
        moduleId: '',
        unitId: '',
        toolGroupId: '',
      }));
    }
  }, [formData.courseSectionId, allCourses]);

  useEffect(() => {
    if (formData.courseId) {
      const newFilteredModules = allModules.filter(module => module.courseId._id === formData.courseId);
      setFilteredModules(newFilteredModules);
      setFilteredUnits([]); // Reset units when course changes
      setFilteredToolGroups([]);

      setFormData(prevData => ({
        ...prevData,
        moduleId: '',
        unitId: '',
        toolGroupId: '',
      }));
    } else {
      setFilteredModules([]);

      setFormData(prevData => ({
        ...prevData,
        moduleId: '',
        unitId: '',
        toolGroupId: '',
      }));
    }
  }, [formData.courseId, allModules]);

  useEffect(() => {
    if (formData.moduleId) {
      const newFilteredUnits = allUnits.filter(unit => unit.moduleId._id === formData.moduleId);
      setFilteredUnits(newFilteredUnits);
      setFilteredToolGroups([]);

      setFormData(prevData => ({
        ...prevData,
        unitId: '',
        toolGroupId: '',
      }));
    } else {
      setFilteredUnits([]);

      setFormData(prevData => ({
        ...prevData,
        unitId: '',
        toolGroupId: '',
      }));
    }
  }, [formData.moduleId, allUnits]);

  useEffect(() => {
    if (formData.unitId) {
      const newFilteredToolGroups = allToolGroups.filter(group => group.unitId._id === formData.unitId);
      setFilteredToolGroups(newFilteredToolGroups);

      setFormData(prevData => ({
        ...prevData,
        toolGroupId: '',
      }));
    } else {
      setFilteredToolGroups([]);

      setFormData(prevData => ({
        ...prevData,
        toolGroupId: '',
      }));
    }
  }, [formData.unitId, allToolGroups]);

  const handleAdd = async () => {

    const titleRegex = /^[a-zA-Z0-9,()\/\-\s]{5,180}$/;
    const nameRegex = /^[a-zA-Z0-9,()\/\-\s.]{3,60}$/
    const descriptionRegex = /^[a-zA-Z0-9,().\/\-\s—]{40,1500}$/
    const urlRegex = /^https:\/\/(introbirds-sims|introbirdss).*\/index\.html$/;

    setFormError(false)
    setImageError(false);
    setTitleError(false);
    setNameError(false);
    setDescriptionError(false);
    setUrlError(false);
    setFileError(false);
    setFileNumberError(false);
    

    try {
      if (activeTab === 'toolGroups') {

        if ( !formData.title || !formData.courseSectionId || !formData.courseId || !formData.moduleId || 
             !formData.unitId)   
        {
          setFormError(true);
          return;
        }

        if (!titleRegex.test(formData.title)) {
          setTitleError(true);
          return;
      }

        const file = imageInput.current.files[0];

        if (imageInput.current.files.length > 1) {
          setFileNumberError(true);
          return;
        }

        let imageUrl = null;
    
        if (file) {
          const allowedTypes = ['image/jpeg', 'image/png']; // Allowed image types
      
          if (!allowedTypes.includes(file.type)) {
            setImageError(true);
            return;
          }
      
          const uploadResponse = await axiosInstance.get('/contentManagement/uploadImage');
          const url = uploadResponse.data.url;
      
          await fetch(url, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type
            },
            body: file
          });
      
          imageUrl = url.split('?')[0];
        }

        await axiosInstance.post('/lessonManagement/addToolGroup', { 
          courseSectionId: formData.courseSectionId,
          courseId: formData.courseId,
          moduleId: formData.moduleId,            
          unitId: formData.unitId,
          title: formData.title,
          image: imageUrl || null
        });

      } else if (activeTab === 'practicalGroups') {

        if ( !formData.title || !formData.courseSectionId || !formData.courseId || !formData.moduleId || 
          !formData.unitId || !formData.practicalSimulation)   
        {
          setFormError(true);
          return;
        }

        if (!titleRegex.test(formData.title)) {
          setTitleError(true);
          return;
        }

        if (!urlRegex.test(formData.practicalSimulation)) {
          setUrlError(true);
          return;
        }

        const file = imageInput.current.files[0];

        if (imageInput.current.files.length > 1) {
          setFileNumberError(true);
          return;
        }

        let imageUrl = null;
    
        if (file) {
          const allowedTypes = ['image/jpeg', 'image/png']; // Allowed image types
      
          if (!allowedTypes.includes(file.type)) {
            setImageError(true);
            return;
          }
      
          const uploadResponse = await axiosInstance.get('/contentManagement/uploadImage');
          const url = uploadResponse.data.url;
      
          await fetch(url, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type
            },
            body: file
          });
      
          imageUrl = url.split('?')[0];
        }

        await axiosInstance.post('/lessonManagement/addPracticalGroup', { 
          courseSectionId: formData.courseSectionId,
          courseId: formData.courseId,
          moduleId: formData.moduleId,
          unitId: formData.unitId,
          title: formData.title,
          image: imageUrl || null,
          simulationPath: formData.practicalSimulation
        });
    
      } else if (activeTab === 'tools') {

        if ( !formData.name || !formData.description || !formData.courseSectionId || !formData.courseId || 
          !formData.moduleId || !formData.unitId || !formData.toolGroupId || !objectInput.current.files[0]) 
        {
          setFormError(true);
          return;
        }

        if (!nameRegex.test(formData.name)) {
          setNameError(true);
          return;
        }

        if (!descriptionRegex.test(formData.description)) {
          setDescriptionError(true);
          return;
        }

        const file = objectInput.current.files[0];
        if (objectInput.current.files.length > 1) {
          setFileNumberError(true);
          return;
        }


        if (file) {
          const allowedExtensions = ['glb'];
          const extension = file.name.split('.').pop().toLowerCase();
          
          // Validate the file extension
          if (!allowedExtensions.includes(extension)) {
            setFileError(true); // You can customize this error to be more specific
            return;
          }
      
          // Upload the file
          const uploadResponse = await axiosInstance.get(`/lessonManagement/uploadObject?extension=${extension}`);
          const url = uploadResponse.data.url;
      
          await fetch(url, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type
            },
            body: file
          });
      
          const objectUrl = url.split('?')[0];
      
          await axiosInstance.post('/lessonManagement/addTool', { 
            courseSectionId: formData.courseSectionId,
            courseId: formData.courseId,
            moduleId: formData.moduleId,
            unitId: formData.unitId,
            toolGroupId: formData.toolGroupId,
            name: formData.name,
            description: formData.description,
            modelPath: objectUrl 
          });
        }

      }

      setShowModal(false);
      setFormData({ 
        title: '', 
        image:'', 
        courseSectionId: '', 
        courseId: '', 
        moduleId: '', 
        unitId: '', 
        toolGroupId: '', 
        practicalSimulation: '',
        name: '',
        description: '',
        modelPath: '' });

      if (imageInput.current) {
          imageInput.current.value = '';
      }

      if (objectInput.current) {
        objectInput.current.value = '';
      }

      fetchContent();
      setFormError(false);
      setTitleError(false);
      setNameError(false);
      setDescriptionError(false);
      setUrlError(false);
      setFileError(false);
      setFileNumberError(false)
    } catch (error) {
      console.error('Error adding data:', error);
    }
  };

  return (
    showModal && (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center font-sf-regular items-center">
        <div className="bg-white p-6 rounded shadow-lg w-full sm:w-1/2 text-gray-700">
        <h2 className="text-xl mb-4 font-sf-bold">
          {activeTab === 'toolGroups' ? 'Add Tool Group' :
            activeTab === 'practicalGroups' ? 'Add Practical' :
            `Add ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`
          }
        </h2>
          {(activeTab === 'toolGroups' || activeTab === 'practicalGroups') && (
          <>
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mb-4 p-2 border border-gray-300 rounded w-full"
            />

            <div className='mb-5'>
              <label>
                Cover Photo:
                <input
                  className='ml-2'
                  type="file"
                  ref={imageInput}
                />
              </label>
            </div>
          </>
        )}
  
          {activeTab === 'practicalGroups' && (
              <input
              type="text"
              placeholder="Simulation Path"
              value={formData.practicalSimulation}
              onChange={(e) => setFormData({ ...formData, practicalSimulation: e.target.value })}
              className="mb-4 p-2 border border-gray-300 rounded w-full"
            />
          )}

          <select
            value={formData.courseSectionId}
            onChange={(e) => setFormData({ ...formData, courseSectionId: e.target.value })}
            className="mb-4 p-2 border border-gray-300 rounded w-full"
          >
            <option value="">Select Course Section</option>
            {courseSections.map((section) => (
              <option key={section._id} value={section._id}>
                {section.title}
              </option>
            ))}
          </select>

          <select
            value={formData.courseId}
            onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
            className="mb-4 p-2 border border-gray-300 rounded w-full"
          >
            <option value="">Select Course</option>
            {filteredCourses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>

          <select
            value={formData.moduleId}
            onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
            className="mb-4 p-2 border border-gray-300 rounded w-full"
          >
            <option value="">Select Module</option>
            {filteredModules.map((module) => (
              <option key={module._id} value={module._id}>
                {module.title}
              </option>
            ))}
          </select>

          <select
            value={formData.unitId}
            onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
            className="mb-4 p-2 border border-gray-300 rounded w-full"
          >
            <option value="">Select Unit</option>
            {filteredUnits.map((unit) => (
              <option key={unit._id} value={unit._id}>
                {unit.title}
              </option>
            ))}
          </select>

          {activeTab === 'tools' && (
            <select
              value={formData.toolGroupId}
              onChange={(e) => setFormData({ ...formData, toolGroupId: e.target.value })}
              className="mb-4 p-2 border border-gray-300 rounded w-full"
            >
              <option value="">Select Tool Group</option>
              {filteredToolGroups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.title}
                </option>
              ))}
            </select>
          )}

          {activeTab === 'tools' && (
            <>
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mb-4 p-2 border border-gray-300 rounded w-full"
              />

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mb-4 p-2 border border-gray-300 rounded w-full"
              />

              <div className='mb-5'>
                <label>
                  3D Model:
                  <input
                    className='ml-2'
                    type="file"
                    ref={objectInput}
                  />
                </label>
              </div>
            </>
          )}

          {formError && (
            <p className="text-red-500 text-sm mt-2">Please input all required fields.</p>
          )}

          {imageError && (
            <p className="text-red-500 text-sm mt-2">Please select an image file (JPEG, PNG).</p>
          )}
   
          {titleError && (
              <p className="text-red-500 text-sm mt-2">Title is either too long, short, or contains invalid characters.</p>
          )}

          {nameError && (
              <p className="text-red-500 text-sm mt-2">Tool name is either too long, short, or contains invalid characters.</p>
          )}

          {descriptionError && (
            <p className="text-red-500 text-sm mt-2">Description is either too long, short, or contains invalid characters.</p>
          )}
   
          {urlError && (
              <p className="text-red-500 text-sm mt-2">Simulation path is not from a valid source.</p>
          )}

          {fileError && (
              <p className="text-red-500 text-sm mt-2">Invalid file type for tool.</p>
          )}

          {fileNumberError && (
              <p className="text-red-500 text-sm mt-2">You can only upload one file.</p>
          )}
          
      
          <div className='my-3 flex justify-end'>
            <button onClick={handleAdd} className="py-2 px-4 bg-blue-500 text-white mr-2">
              Add
            </button>
            <button
              onClick={() => {
                setShowModal(false);
                setFormData({ 
                  title: '', 
                  image: '', 
                  courseSectionId: '', 
                  courseId: '', 
                  moduleId: '', 
                  unitId: '', 
                  toolGroupId: '', 
                  practicalSimulation: '',
                  name: '',
                  description: '',
                  modelPath: '' 
                });
                setFormError(false);
                setTitleError(false);
                setNameError(false);
                setDescriptionError(false);
                setUrlError(false);
                setImageError(false);
                setFileError(false);
                setFileNumberError(false);
                if (imageInput.current) {
                  imageInput.current.value = ''; // Reset file input
                }    
                if (objectInput.current) {
                  objectInput.current.value = ''; // Reset file input
                }    
              }}
              className="py-2 px-4 bg-gray-500 text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default AddLesson;
