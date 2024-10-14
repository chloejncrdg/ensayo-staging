
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const EditContent = ({ activeTab, showModal, setShowModal, fetchContent, selectedItem }) => {
  const [formData, setFormData] = useState({
    title: '',
    courseSectionId: '',
    courseId: '',
    moduleId: '',
    image: '',
    archived: false,
  });
  const [courseSections, setCourseSections] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [formError, setFormError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [textError, setTextError] = useState(false);
  const [fileNumberError, setFileNumberError] = useState(false);
  const imageInput = useRef(null);

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
  

  useEffect(() => {
    async function fetchOptions() {
      try {
        const [courseSectionsResponse, coursesResponse, modulesResponse] = await Promise.all([
          axiosInstance.get('/contentManagement/getAllCourseSections'),
          axiosInstance.get('/contentManagement/getAllCourses'),
          axiosInstance.get('/contentManagement/getAllModules'),
        ]);

        const nonArchivedSections = courseSectionsResponse.data.courseSections.filter(section => !section.archived);
        setCourseSections(nonArchivedSections);
      
        const nonArchivedCourses = coursesResponse.data.courses.filter(course => !course.archived);
        setCourses(nonArchivedCourses);

        const nonArchivedModules = modulesResponse.data.modules.filter(module => !module.archived);
        setModules(nonArchivedModules)
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    }
    fetchOptions();
  }, [showModal, activeTab, courseSections.length, courses.length, modules.length]);

  useEffect(() => {
    if (selectedItem) {
      setFormData({
        title: selectedItem.title || '',
        courseSectionId: selectedItem.courseSectionId?._id || '',
        courseId: selectedItem.courseId?._id || '',
        moduleId: selectedItem.moduleId?._id || '',
        image: selectedItem.image || '',
        archived: selectedItem.archived || false,
      });
    }
  }, [selectedItem]);

  useEffect(() => {
    if (formData.courseSectionId) {
      const filteredCourses = courses.filter(course => course.courseSectionId._id === formData.courseSectionId);
      setFilteredCourses(filteredCourses);

      if (!filteredCourses.some(course => course._id === formData.courseId)) {
        setFormData(prev => ({ ...prev, courseId: '' }));
        setFilteredModules([]); // Reset modules when course section changes
      } else {
        // If course is still valid, filter modules based on selected course
        const newFilteredModules = modules.filter(module => module.courseId._id === formData.courseId);
        setFilteredModules(newFilteredModules);
      }
    } else {
      setFilteredCourses([]);
      setFilteredModules([]); // if user clicks on "select course section" again, it will reset modules too
    }
  }, [formData.courseSectionId, courses]);

  useEffect(() => {
    if (formData.courseId) {
      const filteredModules = modules.filter(module => module.courseId._id === formData.courseId);
      setFilteredModules(filteredModules);
      
      if (!filteredModules.some(module => module._id === formData.moduleId)) {
        setFormData(prev => ({ ...prev, moduleId: '' })); // Reset moduleId if the course changes
      }
    } else {
      setFilteredModules([]);
      setFormData(prev => ({ ...prev, moduleId: '' })); // Reset moduleId if no course is selected
    }
  }, [formData.courseId, modules]);
  

  const handleEdit = async (updatedFormData = formData) => {

    const regex = /^[a-zA-Z0-9,()\/\-\s]{5,180}$/;

    setFormError(false);
    setTextError(false);
    setFileNumberError(false);

    try {
      // Validate for course sections
      if (activeTab === 'courseSections' && !formData.title) {
        setFormError(true);
        return;
      }
  
      // Validate for courses
      if (activeTab === 'courses' && (!formData.title || !formData.courseSectionId)) {
        setFormError(true);
        return;
      }
  
      // Validate for modules
      if (activeTab === 'modules' && (!formData.title || !formData.courseSectionId || !formData.courseId)) {
        setFormError(true);
        return;
      }
  
      // Validate for units
      if (activeTab === 'units' && (!formData.title || !formData.courseSectionId || !formData.courseId || !formData.moduleId)) {
        setFormError(true);
        return;
      }
  
      // Title regex validation
      if (!regex.test(formData.title)) {
        setTextError(true);
        return;
      }
  
  
      let url = '';
      let data = {
        title: formData.title,
        archived: updatedFormData.archived,
      };
  
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
  
      switch (activeTab) {
        case 'courseSections':
          url = `/contentManagement/editCourseSection/${selectedItem._id}`;
          break;
        case 'courses':
          url = `/contentManagement/editCourse/${selectedItem._id}`;
          data = {
            ...data,
            courseSectionId: formData.courseSectionId,
            image: imageUrl,
          };
          break;
        case 'modules':
          url = `/contentManagement/editModule/${selectedItem._id}`;
          data = {
            ...data,
            courseSectionId: formData.courseSectionId,
            courseId: formData.courseId,
            image: imageUrl,
          };
          break;
        case 'units':
          url = `/contentManagement/editUnit/${selectedItem._id}`;
          data = {
            ...data,
            courseSectionId: formData.courseSectionId,
            courseId: formData.courseId,
            moduleId: formData.moduleId,
            image: imageUrl,
          };
          break;
        default:
          break;
      }
  
      await axiosInstance.put(url, data);
  
      if (updatedFormData.archived) {
        let archiveUrl = '';
        switch (activeTab) {
          case 'courseSections':
            archiveUrl = `/contentManagement/archiveCourseSection/${selectedItem._id}`;
            break;
          case 'courses':
            archiveUrl = `/contentManagement/archiveCourse/${selectedItem._id}`;
            break;
          case 'modules':
            archiveUrl = `/contentManagement/archiveModule/${selectedItem._id}`;
            break;
          case 'units':
            archiveUrl = `/contentManagement/archiveUnit/${selectedItem._id}`;
            break;
          default:
            break;
        }
        await axiosInstance.put(archiveUrl);
      }
  
      setShowModal(false);
      fetchContent(); // Fetch updated content after editing
      setFormError(false);
      setTextError(false);
      setFileNumberError(false);
      if (imageInput.current) {
        imageInput.current.value = ''; // Reset file input
      }
    } catch (error) {
      console.error('Error editing data:', error);
    }
  };

  return (
    showModal && (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center font-sf-regular">
        <div className="bg-white p-6 rounded shadow-lg w-full sm:w-1/2 text-gray-700">
        <h2 className="text-xl mb-4 font-sf-bold">
          {activeTab === 'courseSections' ? 'Edit Course Section' : `Edit ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}`}
        </h2>
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mb-4 p-2 border border-gray-300 rounded w-full"
          />
          {activeTab !== 'courseSections' && (
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
          )}
          {(activeTab === 'modules' || activeTab === 'units') && (
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
          )}
          {activeTab === 'units' && (
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
          )}
          {activeTab !== 'courseSections' && (
            <div>
              <label>
                Change photo:
                <input className='ml-2' type="file" ref={imageInput} />
              </label>
            </div>
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

          {textError && (
            <p className="text-red-500 text-sm mt-2">Text is either too short, long, or has invalid characters.</p>
          )}

          {fileNumberError && (
            <p className="text-red-500 text-sm mt-2">You can only choose one file.</p>
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
                  courseSectionId: selectedItem.courseSectionId?._id || '',
                  courseId: selectedItem.courseId?._id || '',
                  moduleId: selectedItem.moduleId?._id || '',
                  image: selectedItem.image || '',
                  archived: selectedItem.archived || false,
                }); // Reset form data
                if (imageInput.current) {
                  imageInput.current.value = ''; // Reset file input
                }
                setFormError(false)
                setImageError(false)
                setTextError(false)
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

export default EditContent;
