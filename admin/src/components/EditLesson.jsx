
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const EditLesson = ({ activeTab, showModal, setShowModal, fetchContent, selectedItem }) => {
  const [formData, setFormData] = useState({
    title: '', 
    image:'', 
    courseSectionId: '', 
    courseId: '', 
    moduleId: '', 
    unitId: '', 
    toolGroupId: '', 
    simulationPath: '',
    name: '',
    description: '',
    modelPath: '',
    archived: false
  });
  const [courseSections, setCourseSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [toolGroups, setToolGroups] = useState([]);
  const [filteredToolGroups, setFilteredToolGroups] = useState([]);
  const [formError, setFormError] = useState(false);
  const [imageError, setImageError] = useState(false)
  const [titleError, setTitleError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  const [urlError, setUrlError] = useState(false);
  const [fileError, setFileError] = useState(false);
  const [fileNumberError, setFileNumberError] = useState(false)
  const imageInput = useRef(null);
  const objectInput = useRef(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  const axiosInstance = axios.create({
    baseURL:process.env.REACT_APP_API_URL,
    withCredentials: true
  });

  const handleArchive = async () => {
    setFormData((prev) => ({ ...prev, archived: true }));
    await handleEdit({ ...formData, archived: true }); // Pass updated data directly
    setShowDeleteModal(false);
  };
  
  const handleRestore = async () => {
    setFormData((prev) => ({ ...prev, archived: false }));
    await handleEdit({ ...formData, archived: false }); // Pass updated data directly
    setShowRestoreModal(false); // Close the restore modal
  };
  

const handleCourseSectionChange = (e) => {
  const newCourseSectionId = e.target.value;
  if (newCourseSectionId !== formData.courseSectionId) {
    setFormData({
      ...formData,
      courseSectionId: newCourseSectionId,
      courseId: '',
      moduleId: '',
      unitId: '',
      toolGroupId: '',
    });
    setFilteredCourses([]); // Reset courses
    setFilteredModules([]); // Reset modules
    setFilteredUnits([]); // Reset units
    setFilteredToolGroups([]); // Reset tool groups
  }
};


const handleCourseChange = (e) => {
  const newCourseId = e.target.value;
  if (newCourseId !== formData.courseId) {
    setFormData({
      ...formData,
      courseId: newCourseId,
      moduleId: '',
      unitId: '',
      toolGroupId: '',
    });
    setFilteredModules([]); // Reset modules
    setFilteredUnits([]); // Reset units
    setFilteredToolGroups([]); // Reset tool groups
  }
};

const handleModuleChange = (e) => {
  const newModuleId = e.target.value;
  if (newModuleId !== formData.moduleId) {
    setFormData({
      ...formData,
      moduleId: newModuleId,
      unitId: '',
      toolGroupId: '',
    });
    setFilteredUnits([]); // Reset units
    setFilteredToolGroups([]); // Reset tool groups
  }
};

const handleUnitChange = (e) => {
  const newUnitId = e.target.value;
  if (newUnitId !== formData.unitId) {
    setFormData({
      ...formData,
      unitId: newUnitId,
      toolGroupId: '',
    });
    setFilteredToolGroups([]); // Reset tool groups
  }
};


  useEffect(() => {
    async function fetchOptions() {
      try {
        const [courseSectionsResponse, coursesResponse, modulesResponse, unitsResponse, toolGroupsResponse] = await Promise.all([
          axiosInstance.get('/contentManagement/getAllCourseSections'),
          axiosInstance.get('/contentManagement/getAllCourses'),
          axiosInstance.get('/contentManagement/getAllModules'),
          axiosInstance.get('/contentManagement/getAllUnits'),
          axiosInstance.get('/lessonManagement/getAllToolGroups')
        ]);

        const nonArchivedSections = courseSectionsResponse.data.courseSections.filter(section => !section.archived);
        setCourseSections(nonArchivedSections);
      
        const nonArchivedCourses = coursesResponse.data.courses.filter(course => !course.archived);
        setCourses(nonArchivedCourses);

        const nonArchivedModules = modulesResponse.data.modules.filter(module => !module.archived);
        setModules(nonArchivedModules)

        const nonArchivedUnits = unitsResponse.data.units.filter(unit => !unit.archived);
        setUnits(nonArchivedUnits)

        const nonArchivedToolGroups = toolGroupsResponse.data.toolGroups.filter(toolGroup => !toolGroup.archived);
        setToolGroups(nonArchivedToolGroups)

      } catch (error) {
        console.error('Error fetching options:', error);
      }
    }
    fetchOptions();
  }, [showModal, activeTab, courseSections.length, courses.length, modules.length, units.length, toolGroups.length]);

  useEffect(() => {
    if (selectedItem) {
      setFormData({
        title: selectedItem.title || '',
        image: selectedItem.image || '',
        courseSectionId: selectedItem.courseSectionId?._id || '',
        courseId: selectedItem.courseId?._id || '',
        moduleId: selectedItem.moduleId?._id || '',
        unitId: selectedItem.unitId?._id || '',
        toolGroupId: selectedItem.toolGroupId?._id || '',
        simulationPath: selectedItem.simulationPath || '',
        name: selectedItem.name || '',
        description: selectedItem.description || '',
        modelPath: selectedItem.modelPath || '',
        archived: selectedItem.archived || false
      });
    }
  }, [selectedItem]);

  useEffect(() => {
    if (formData.courseSectionId) {
      const filteredCourses = courses.filter(course => course.courseSectionId._id === formData.courseSectionId);
      setFilteredCourses(filteredCourses);
      setFilteredModules([]); // Reset modules when course section changes
      setFilteredUnits([]);
      setFilteredToolGroups([]);
      
    } else {
      setFilteredCourses([]);
    }
  }, [formData.courseSectionId, courses]);

  useEffect(() => {
    if (formData.courseId) {
      const filteredModules = modules.filter(module => module.courseId._id === formData.courseId);
      setFilteredModules(filteredModules);
      setFilteredUnits([]);
      setFilteredToolGroups([]);
    } else {
      setFilteredModules([]);
    }
  }, [formData.courseId, modules]);

  useEffect(() => {
    if (formData.moduleId) {
      const filteredUnits = units.filter(unit => unit.moduleId._id === formData.moduleId);
      setFilteredUnits(filteredUnits);
      setFilteredToolGroups([]);
    } else {
      setFilteredUnits([]);
    }
  }, [formData.moduleId, units]);

  useEffect(() => {
    if (formData.unitId) {
      const filteredToolGroups = toolGroups.filter(toolGroup => toolGroup.unitId._id === formData.unitId);
      setFilteredToolGroups(filteredToolGroups);
    } else {
      setFilteredToolGroups([]);
    }
  }, [formData.unitId, toolGroups]);

  const handleEdit = async (updatedFormData = formData) => {

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
      if (
        formData.courseSectionId === '' ||
        formData.courseId === '' ||
        formData.moduleId === '' ||
        formData.unitId === '' ||
        (activeTab === 'tools' && (formData.toolGroupId === '' || formData.description === '' || formData.name === '')) 
        || (activeTab === 'practicalGroups' && (formData.simulationPath === '' || formData.title === ''))
      ) {
        setFormError(true);
        return;
      }

      if (activeTab === 'toolGroups') {

          if (!formData.title) {
            setTitleError(true);
            return;
          }
          
          if (!titleRegex.test(formData.title)) {
              setTitleError(true);
              return;
          }

      } else if (activeTab === 'practicalGroups') {
          // Validate the title and simulation path for practical groups
          if (!titleRegex.test(formData.title)) {
              setTitleError(true);
              return;
          }
      
          if (!urlRegex.test(formData.simulationPath)) {
              setUrlError(true);
              return;
          }
      } else if (activeTab === 'tools') {
          // Validate the name and description for tools
          if (!nameRegex.test(formData.name)) {
              setNameError(true);
              return;
          }
      
          if (!descriptionRegex.test(formData.description)) {
              setDescriptionError(true);
              return;
          }
      }
    

  
      let url = '';
      let data = {};

      let imageUrl = formData.image;

      if (imageInput.current && imageInput.current.files.length > 0) {

        if (imageInput.current.files.length > 1) {
          setFileNumberError(true);
          return;
        }

        const file = imageInput.current.files[0];
        const allowedTypes = ['image/jpeg', 'image/png']; // Allowed image types
      
        if (!allowedTypes.includes(file.type)) {
          setImageError(true);
          return;
        }
      
        const uploadResponse = await axiosInstance.get('/contentManagement/uploadImage');
        imageUrl = uploadResponse.data.url;
      
        await fetch(imageUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        });
      
        imageUrl = imageUrl.split('?')[0];
      }

      let objectUrl = formData.modelPath;

      if (objectInput.current && objectInput.current.files.length > 0) {

        if (objectInput.current.files.length > 1) {
          setFileNumberError(true);
          return;
        }


        const file = objectInput.current.files[0];
        const extension = file.name.split('.').pop();

        const allowedExtensions = ['glb'];

        if (!allowedExtensions.includes(extension)) {
          setFileError(true); // You can customize this error to be more specific
          return;
        }

      
        const uploadResponse = await axiosInstance.get(`/lessonManagement/uploadObject?extension=${extension}`);
        objectUrl = uploadResponse.data.url;
  

        await fetch(objectUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        });
  
        objectUrl = objectUrl.split('?')[0];  
      }
  
      switch (activeTab) {
        case 'toolGroups':
          url = `/lessonManagement/editToolGroup/${selectedItem._id}`;
          data = {
            title: formData.title,
            image: imageUrl,
            courseSectionId: formData.courseSectionId,
            courseId: formData.courseId,
            moduleId: formData.moduleId,
            unitId: formData.unitId,
            archived: updatedFormData.archived
          };
          break;
        case 'practicalGroups':
          url = `/lessonManagement/editPracticalGroup/${selectedItem._id}`;
          data = {
            title: formData.title,
            image: imageUrl,
            simulationPath: formData.simulationPath,
            courseSectionId: formData.courseSectionId,
            courseId: formData.courseId,
            moduleId: formData.moduleId,
            unitId: formData.unitId,
            archived: updatedFormData.archived
          };
          break;
        case 'tools':
          url = `/lessonManagement/editTool/${selectedItem._id}`;
          data = {
            name: formData.name,
            description: formData.description,
            modelPath: objectUrl,
            courseSectionId: formData.courseSectionId,
            courseId: formData.courseId,
            moduleId: formData.moduleId,
            unitId: formData.unitId,
            toolGroupId: formData.toolGroupId,
            archived: updatedFormData.archived
          };
          break;
        default:
          break;
      }
  
      await axiosInstance.put(url, data);

      if (updatedFormData.archived) {
        let archiveUrl = '';
        switch (activeTab) {
          case 'toolGroups':
            archiveUrl = `/lessonManagement/archiveToolGroup/${selectedItem._id}`;
            break;
          case 'practicalGroups':
            archiveUrl = `/lessonManagement/archivePracticalGroup/${selectedItem._id}`;
            break;
          case 'tools':
            archiveUrl = `/lessonManagement/archiveTool/${selectedItem._id}`;
            break;
          default:
            break;
        }
        await axiosInstance.put(archiveUrl);
      }

      setShowModal(false);
      fetchContent(); // Fetch updated content after editing
      setFormError(false);
      if (imageInput.current) {
        imageInput.current.value = ''; // Reset file input
      }
      if (objectInput.current) {
        objectInput.current.value = ''; // Reset file input
      }
      setTitleError(false)
      setNameError(false)
      setDescriptionError(false)
      setUrlError(false)
      setFileError(false)
      setFileNumberError(false)
    } catch (error) {
      console.error('Error editing data:', error);
    }
  };

  return (
    showModal && (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center font-sf-regular items-center">
        <div className="bg-white p-6 rounded shadow-lg w-full sm:w-1/2 text-gray-700">
          <h2 className="text-xl mb-4 font-sf-bold">
            {activeTab === 'toolGroups' ? 'Edit Tool Group' :
              activeTab === 'practicalGroups' ? 'Edit Practical' :
              `Edit ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`
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
          </>
        )}

          {activeTab === 'practicalGroups' && (
            <>
              <input
                type="text"
                placeholder="Simulation Path"
                value={formData.simulationPath}
                onChange={(e) => setFormData({ ...formData, simulationPath: e.target.value })}
                className="mb-4 p-2 border border-gray-300 rounded w-full"
              />
            </>
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
              <div className='mb-3'>
                <label>
                  Change 3d Model:
                  <input
                    className='ml-2'
                    type="file"
                    ref={objectInput}
                  />
                </label>
              </div>
            </>
          )}
          
          <select
            value={formData.courseSectionId}
            onChange={handleCourseSectionChange}
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
            onChange={handleCourseChange}
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
            onChange={handleModuleChange}
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
            onChange={handleUnitChange}
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
            <>
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
            </>
          )}

        {(activeTab === 'toolGroups' || activeTab === 'practicalGroups') && (
          <>
            <div>
              <label>
                Change Cover Photo:
                <input
                  className='ml-2'
                  type="file"
                  ref={imageInput}
                />
              </label>
            </div>
          </>
        )}

          <div className="flex justify-between mt-6">
            {!formData.archived ? (
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </button>
            ) : (
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={() => setShowRestoreModal(true)}
              >
                Restore
              </button>
            )}
          </div>
          
          {formError && <p className="text-red-500 text-sm mt-2">Please input all required fields.</p>}

          {imageError && (
            <p className="text-red-500 text-sm mt-2">Please select an image file (JPEG, PNG).</p>
          )}

          {titleError && (
            <p className="text-red-500 text-sm mt-2">Text is either too long, short, or has invalid characters.</p>
          )}

          {nameError && (
            <p className="text-red-500 text-sm mt-2">Tool name is either too long, short, or has invalid characters</p>
          )}

          {descriptionError && (
            <p className="text-red-500 text-sm mt-2">Description is either too long, short, or has invalid characters</p>
          )}

          {urlError && (
            <p className="text-red-500 text-sm mt-2">Simulation path link is from an invalid source</p>
          )}

          {fileError && (
            <p className="text-red-500 text-sm mt-2">Invalid file type for 3d model. File must be in glb</p>
          )}

          {fileNumberError && (
            <p className="text-red-500 text-sm mt-2">You can only upload one file</p>
          )}

          <div className='my-3 flex justify-end'>
            <button onClick={handleEdit} className="py-2 px-4 bg-blue-500 text-white mr-2">
              Save
            </button>
            <button
              onClick={() => {
                setShowModal(false);
                setFormData({
                  title: selectedItem.title || '',
                  image: selectedItem.image || '',
                  courseSectionId: selectedItem.courseSectionId?._id || '',
                  courseId: selectedItem.courseId?._id || '',
                  moduleId: selectedItem.moduleId?._id || '',
                  unitId: selectedItem.unitId?._id || '',
                  toolGroupId: selectedItem.toolGroupId?._id || '',
                  simulationPath: selectedItem.simulationPath || '',
                  name: selectedItem.name || '',
                  description: selectedItem.description || '',
                  modelPath: selectedItem.modelPath || '',
                  archived: selectedItem.archived || false
                });
                if (imageInput.current) {
                  imageInput.current.value = ''; // Reset file input
                }
                if (objectInput.current) {
                  objectInput.current.value = ''; // Reset file input
                }
                setFormError(false)
                setImageError(false)
                setTitleError(false)
                setNameError(false)
                setDescriptionError(false)
                setUrlError(false)
                setFileError(false)
                setFileNumberError(false)
              }}
              className="py-2 px-4 bg-gray-500 text-white"
            >
              Cancel
            </button>
          </div>
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-lg w-full sm:w-1/2 text-gray-700">
              <h2 className="text-2xl font-sf-bold mb-8 text-red-700">Important Notice</h2>
              <p>
                Deleting this item will also delete everything under it, including related content and user progress for this section. 
                Please note that:
              </p>
              <ul className="list-disc list-inside my-2 ml-6">
                <li>All associated content will be removed.</li>
                <li>Any progress made by users in this section will be lost.</li>
                <li>You can restore this item later, but the content under it must be restored manually one by one.</li>
              </ul>
              <p className='mt-6'>Please proceed with caution.</p>
              <p className="mt-6 font-bold">Do you want to proceed with deleting this item?</p>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleArchive}
                  className="py-2 px-4 bg-red-500 text-white mr-2"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="py-2 px-4 bg-gray-500 text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}


        {showRestoreModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-lg w-full sm:w-1/2">
              <h3 className="text-2xl mb-6 font-sf-bold">Restore Item</h3>
              <p className='mb-4'>You're about to restore this item. Please review the following information:</p>
              <ul className="list-disc pl-5 space-y-2 ml-6">
                <li>The restored item will become visible to users again.</li>
                <li>This action only restores the selected item, not its sub-items or related content.</li>
                <li>To ensure data integrity, sub-items must be restored individually.</li>
                <li>You can find and restore sub-items through the respective tables in the admin interface.</li>
              </ul>
              <p className="mt-4">
                Carefully review the item before making it visible to users.
              </p>
              <p className="mt-6 font-bold">Do you want to proceed with restoring this item?</p>
              <div className="flex justify-end gap-3 mt-8">
                <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" onClick={handleRestore}>
                  Yes, restore
                </button>
                <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400" onClick={() => setShowRestoreModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    )
  );
};

export default EditLesson;

