import { CourseSection, Course, Module, Unit, ToolGroup, PracticalGroup, Tool } from "../models/Content.js";
import User from "../models/User.js";
import Progress from "../models/Progress.js";

import { generateUploadImageURL } from "../s3.js";


// CREATE

export const addCourseSection = async (req, res) => {
    try {
      const { title } = req.body;
      const newCourseSection = new CourseSection({ title });
      await newCourseSection.save();
      res.status(201).json(newCourseSection);
    } catch (error) {
      res.status(500).json({ error: 'Error adding course section' });
    }
  };
  
  export const addCourse = async (req, res) => {
    try {
      const { courseSectionId, title, image } = req.body;
      const newCourse = new Course({ courseSectionId, title, image: image || null });
      await newCourse.save();
      res.status(201).json(newCourse);
    } catch (error) {
      res.status(500).json({ error: 'Error adding course' });
    }
  };

    
  export const addModule = async (req, res) => {
    try {
      const { title, courseSectionId, courseId, image } = req.body;
      const newModule = new Module({
        title,
        courseSectionId,
        courseId, 
        image: image || null,
      });
      const savedModule = await newModule.save();
      res.status(201).json(savedModule);
    } catch (error) {
      res.status(500).json({ error: 'Error adding module' });
    }
  };

  export const addUnit = async (req, res) => {
    try {
      const { title, courseSectionId, courseId, moduleId, image } = req.body;
      const newUnit = new Unit({
        title,
        courseSectionId, // Assuming this is the ID of the course section
        courseId, // Assuming this is the ID of the course
        moduleId, // Assuming this is the ID of the module
        image: image || null,
      });
      const savedUnit = await newUnit.save();
      res.status(201).json(savedUnit);
    } catch (error) {
      res.status(500).json({ error: 'Error adding unit' });
    }
  };
  

// RETRIEVE 

export const getAllCourseSections = async (req, res) => {
  try {
    const { search = '' } = req.query;

    let query = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } } // Case-insensitive regex search
        ]
      };
    }

    // Fetch course sections with pagination
    const courseSections = await CourseSection.find(query)
      .exec();

    // Fetch total count of course sections for pagination
    const totalCount = await CourseSection.countDocuments(query);


    res.status(200).json({
      courseSections,
      totalCount
    });
  } catch (error) {
    console.error('Error fetching course sections:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getAllCourses = async (req, res) => {
    try {
        const { search = '' } = req.query;

        let query = {};
        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } } // Case-insensitive regex search
                ]
            };
        }


        const courses = await Course.find(query)
            .populate('courseSectionId', 'title') // Populate the courseSectionId field with the title from the CourseSection model
            .exec();

        const totalCount = await Course.countDocuments(query);


        res.status(200).json({
          courses,
          totalCount
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Error fetching courses' });
    }
};

export const getAllModules = async (req, res) => {
    try {
        const { search = '' } = req.query;

        let query = {};
        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } }, // Case-insensitive regex search
                ]
            };
        }



        const modules = await Module.find(query)
            .populate('courseSectionId', 'title') // Populate the courseSectionId field with the title from the CourseSection model
            .populate('courseId', 'title') // Populate the courseId field with the title from the Course model
            .exec();

        const totalCount = await Module.countDocuments(query);


        res.status(200).json({
            modules,
            totalCount
        });
    } catch (error) {
        console.error('Error fetching modules:', error);
        res.status(500).json({ error: 'Error fetching modules' });
    }
};

export const getAllUnits = async (req, res) => {
    try {
        const { search = '' } = req.query;

        let query = {};
        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } }, // Case-insensitive regex search
                ]
            };
        }

        const units = await Unit.find(query)
            .populate('courseSectionId', 'title') // Populate the courseSectionId field with the title from the CourseSection model
            .populate('courseId', 'title') // Populate the courseId field with the title from the Course model
            .populate('moduleId', 'title') // Populate the moduleId field with the title from the Module model
            .exec();

        const totalCount = await Unit.countDocuments(query);

        res.status(200).json({
            units,
            totalCount
        });
    } catch (error) {
        console.error('Error fetching units:', error);
        res.status(500).json({ error: 'Error fetching units' });
    }
};


export const uploadImage = async (req, res) => {
  try {
    const url = await generateUploadImageURL()
    res.send({ url })
  } catch (err) {
    res.status(500).json({ message: 'Error generating upload image URL', error: err.message})
  }
}

// UPDATE

export const editCourseSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, archived } = req.body;

    const updatedCourseSection = await CourseSection.findByIdAndUpdate(id, { title, archived }, { new: true });

    if (!updatedCourseSection) {
      return res.status(404).json({ error: 'Course section not found' });
    }

    // Find all related content based on the course section ID
    const coursesToUpdate = await Course.find({ courseSectionId: id });
    const modulesToUpdate = await Module.find({ courseSectionId: id });
    const unitsToUpdate = await Unit.find({ courseSectionId: id });
    const toolGroupsToUpdate = await ToolGroup.find({ courseSectionId: id });
    const practicalGroupsToUpdate = await PracticalGroup.find({ courseSectionId: id });
    const toolsToUpdate = await Tool.find({ courseSectionId: id });

    // Update the archived status only if the course section is archived
    if (archived) {
      // Set all related content to archived
      await Promise.all(coursesToUpdate.map(async (course) => {
        course.archived = true; // Set to true if course section is archived
        await course.save();
      }));

      await Promise.all(modulesToUpdate.map(async (module) => {
        module.archived = true; // Set to true if course section is archived
        await module.save();
      }));

      await Promise.all(unitsToUpdate.map(async (unit) => {
        unit.archived = true; // Set to true if course section is archived
        await unit.save();
      }));

      await Promise.all(toolGroupsToUpdate.map(async (toolGroup) => {
        toolGroup.archived = true; // Set to true if course section is archived
        await toolGroup.save();
      }));

      await Promise.all(practicalGroupsToUpdate.map(async (practicalGroup) => {
        practicalGroup.archived = true; // Set to true if course section is archived
        await practicalGroup.save();
      }));

      await Promise.all(toolsToUpdate.map(async (tool) => {
        tool.archived = true; // Set to true if course section is archived
        await tool.save();
      }));
    } else {
      // If course section is not archived, keep the existing archived state of related content
      await Promise.all(coursesToUpdate.map(async (course) => {
        // Optionally, you can decide to keep them unchanged
        await course.save(); // No changes to the archived state
      }));

      await Promise.all(modulesToUpdate.map(async (module) => {
        await module.save(); // No changes to the archived state
      }));

      await Promise.all(unitsToUpdate.map(async (unit) => {
        await unit.save(); // No changes to the archived state
      }));

      await Promise.all(toolGroupsToUpdate.map(async (toolGroup) => {
        await toolGroup.save(); // No changes to the archived state
      }));

      await Promise.all(practicalGroupsToUpdate.map(async (practicalGroup) => {
        await practicalGroup.save(); // No changes to the archived state
      }));

      await Promise.all(toolsToUpdate.map(async (tool) => {
        await tool.save(); // No changes to the archived state
      }));
    }

    res.json(updatedCourseSection);
  } catch (error) {
    console.error('Error updating course section:', error);
    res.status(500).json({ error: 'An error occurred while updating the course section.' });
  }
};



export const editCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, courseSectionId, image, archived } = req.body;

    const updatedCourse = await Course.findByIdAndUpdate(id, { title, courseSectionId, image, archived }, { new: true });

    if (!updatedCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const modulesToUpdate = await Module.find({ courseId: id });
    const unitsToUpdate = await Unit.find({ courseId: id });
    const toolGroupsToUpdate = await ToolGroup.find({ courseId: id });
    const practicalGroupsToUpdate = await PracticalGroup.find({ courseId: id });
    const toolsToUpdate = await Tool.find({ courseId: id });

    if (archived) {
      // Archive all related content if the course is archived
      await Promise.all(modulesToUpdate.map(async (module) => {
        module.courseSectionId = courseSectionId;
        module.archived = true;
        await module.save();
      }));

      await Promise.all(unitsToUpdate.map(async (unit) => {
        unit.courseSectionId = courseSectionId;
        unit.archived = true;
        await unit.save();
      }));

      await Promise.all(toolGroupsToUpdate.map(async (toolGroup) => {
        toolGroup.courseSectionId = courseSectionId;
        toolGroup.archived = true;
        await toolGroup.save();
      }));

      await Promise.all(practicalGroupsToUpdate.map(async (practicalGroup) => {
        practicalGroup.courseSectionId = courseSectionId;
        practicalGroup.archived = true;
        await practicalGroup.save();
      }));

      await Promise.all(toolsToUpdate.map(async (tool) => {
        tool.courseSectionId = courseSectionId;
        tool.archived = true;
        await tool.save();
      }));
    } else {
      // Keep existing states for related content
      await Promise.all(modulesToUpdate.map(async (module) => {
        module.courseSectionId = courseSectionId;
        await module.save(); // No changes to the archived state
      }));

      await Promise.all(unitsToUpdate.map(async (unit) => {
        unit.courseSectionId = courseSectionId;
        await unit.save(); // No changes to the archived state
      }));

      await Promise.all(toolGroupsToUpdate.map(async (toolGroup) => {
        toolGroup.courseSectionId = courseSectionId;
        await toolGroup.save(); // No changes to the archived state
      }));

      await Promise.all(practicalGroupsToUpdate.map(async (practicalGroup) => {
        practicalGroup.courseSectionId = courseSectionId;
        await practicalGroup.save(); // No changes to the archived state
      }));

      await Promise.all(toolsToUpdate.map(async (tool) => {
        tool.courseSectionId = courseSectionId
        await tool.save(); // No changes to the archived state
      }));
    }

    res.status(200).json({ message: 'Course updated successfully' });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'An error occurred while updating the course.' });
  }
};


export const editModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, courseId, courseSectionId, image, archived } = req.body;

    const updatedModule = await Module.findByIdAndUpdate(id, { title, courseId, courseSectionId, image, archived }, { new: true });

    if (!updatedModule) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const unitsToUpdate = await Unit.find({ moduleId: id });
    const toolGroupsToUpdate = await ToolGroup.find({ moduleId: id });
    const practicalGroupsToUpdate = await PracticalGroup.find({ moduleId: id });
    const toolsToUpdate = await Tool.find({ moduleId: id });

    if (archived) {
      // Archive all related content if the module is archived
      await Promise.all(unitsToUpdate.map(async (unit) => {
        unit.courseSectionId = courseSectionId;
        unit.courseId = courseId;
        unit.archived = true;
        await unit.save();
      }));

      await Promise.all(toolGroupsToUpdate.map(async (toolGroup) => {
        toolGroup.courseSectionId = courseSectionId;
        toolGroup.courseId = courseId;
        toolGroup.archived = true;
        await toolGroup.save();
      }));

      await Promise.all(practicalGroupsToUpdate.map(async (practicalGroup) => {
        practicalGroup.courseSectionId = courseSectionId;
        practicalGroup.courseId = courseId;
        practicalGroup.archived = true;
        await practicalGroup.save();
      }));

      await Promise.all(toolsToUpdate.map(async (tool) => {
        tool.courseSectionId = courseSectionId;
        tool.courseId = courseId;
        tool.archived = true;
        await tool.save();
      }));
    } else {
      // Keep existing states for related content
      await Promise.all(unitsToUpdate.map(async (unit) => {
        unit.courseSectionId = courseSectionId;
        unit.courseId = courseId;
        await unit.save(); // No changes to the archived state
      }));

      await Promise.all(toolGroupsToUpdate.map(async (toolGroup) => {
        toolGroup.courseSectionId = courseSectionId;
        toolGroup.courseId = courseId;
        await toolGroup.save(); // No changes to the archived state
      }));

      await Promise.all(practicalGroupsToUpdate.map(async (practicalGroup) => {
        practicalGroup.courseSectionId = courseSectionId;
        practicalGroup.courseId = courseId;
        await practicalGroup.save(); // No changes to the archived state
      }));

      await Promise.all(toolsToUpdate.map(async (tool) => {
        tool.courseSectionId = courseSectionId;
        tool.courseId = courseId;
        await tool.save(); // No changes to the archived state
      }));
    }

    res.status(200).json({ message: 'Module updated successfully' });
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ error: 'An error occurred while updating the module.' });
  }
};



export const editUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, moduleId, courseId, courseSectionId, image, archived } = req.body;

    const updatedUnit = await Unit.findByIdAndUpdate(id, { title, moduleId, courseId, courseSectionId, image, archived }, { new: true });

    if (!updatedUnit) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    const toolGroupsToUpdate = await ToolGroup.find({ unitId: id });
    const practicalGroupsToUpdate = await PracticalGroup.find({ unitId: id });
    const toolsToUpdate = await Tool.find({ unitId: id });

    if (archived) {
      // Archive all related content if the unit is archived
      await Promise.all(toolGroupsToUpdate.map(async (toolGroup) => {
        toolGroup.courseSectionId = courseSectionId;
        toolGroup.courseId = courseId;
        toolGroup.moduleId = moduleId;
        toolGroup.archived = true;
        await toolGroup.save();
      }));

      await Promise.all(practicalGroupsToUpdate.map(async (practicalGroup) => {
        practicalGroup.courseSectionId = courseSectionId;
        practicalGroup.courseId = courseId;
        practicalGroup.moduleId = moduleId;
        practicalGroup.archived = true;
        await practicalGroup.save();
      }));

      await Promise.all(toolsToUpdate.map(async (tool) => {
        tool.courseSectionId = courseSectionId;
        tool.courseId = courseId;
        tool.moduleId = moduleId;
        tool.archived = true;
        await tool.save();
      }));
    } else {
      // Keep existing states for related content
      await Promise.all(toolGroupsToUpdate.map(async (toolGroup) => {
        toolGroup.courseSectionId = courseSectionId;
        toolGroup.courseId = courseId;
        toolGroup.moduleId = moduleId;
        await toolGroup.save(); // No changes to the archived state
      }));

      await Promise.all(practicalGroupsToUpdate.map(async (practicalGroup) => {
        practicalGroup.courseSectionId = courseSectionId;
        practicalGroup.courseId = courseId;
        practicalGroup.moduleId = moduleId;
        await practicalGroup.save(); // No changes to the archived state
      }));

      await Promise.all(toolsToUpdate.map(async (tool) => {
        tool.courseSectionId = courseSectionId;
        tool.courseId = courseId;
        tool.moduleId = moduleId;
        await tool.save(); // No changes to the archived state
      }));
    }

    res.status(200).json({ message: 'Unit updated successfully' });
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({ error: 'An error occurred while updating the unit.' });
  }
};


// DELETE 

export const archiveCourseSection = async (req, res) => {
  try {
    const { id } = req.params;

    // Archive Course Section
    const updatedCourseSection = await CourseSection.findByIdAndUpdate(
      id,
      { archived: true },
      { new: true }
    );

    // Archive associated Courses
    await Course.updateMany(
      { courseSectionId: updatedCourseSection._id },
      { archived: true }
    );

    const modulesToUpdate = await Module.find({ courseSectionId: updatedCourseSection._id });

    // Archive associated Modules
    await Module.updateMany(
      { courseSectionId: updatedCourseSection._id },
      { archived: true }
    );

    // Archive associated Units
    await Unit.updateMany(
      { courseSectionId: updatedCourseSection._id },
      { archived: true }
    );

    // do the same for tool groups and practical groups

    await User.updateMany(
      { enrolledCourses: { $in: modulesToUpdate.map(module => module._id) } },
      { $pull: { enrolledCourses: { $in: modulesToUpdate.map(module => module._id) } } }
    );

    await Progress.deleteMany({
      moduleId: { $in: modulesToUpdate.map(module => module._id) }
    });

    res.status(200).json(updatedCourseSection);
  } catch (error) {
    console.error('Error archiving course section:', error);
    res.status(500).json({ error: 'Error archiving course section' });
  }
};


export const archiveCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Archive Course Section
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { archived: true },
      { new: true }
    );

    const modulesToUpdate = await Module.find({ courseId: updatedCourse._id });

    // Archive associated Modules
    await Module.updateMany(
      { courseId: updatedCourse._id },
      { archived: true }
    );

    // Archive associated Units
    await Unit.updateMany(
      { courseId: updatedCourse._id },
      { archived: true }
    );

   // do the same for tool group and practical group

   await User.updateMany(
    { enrolledCourses: { $in: modulesToUpdate.map(module => module._id) } },
    { $pull: { enrolledCourses: { $in: modulesToUpdate.map(module => module._id) } } }
  );

   await Progress.deleteMany({
    moduleId: { $in: modulesToUpdate.map(module => module._id) }
  });


    res.status(200).json(updatedCourse);
  } catch (error) {
    console.error('Error archiving course:', error);
    res.status(500).json({ error: 'Error archiving course' });
  }
};


export const archiveModule = async (req, res) => {
  try {
    const { id } = req.params;

    // Archive Course Section
    const updatedModule = await Module.findByIdAndUpdate(
      id,
      { archived: true },
      { new: true }
    );

    // Archive associated Units
    await Unit.updateMany(
      { moduleId: updatedModule._id },
      { archived: true }
    );

    // do the same for tool group and practical group

    await User.updateMany(
      { enrolledCourses: updatedModule._id },
      { $pull: { enrolledCourses: updatedModule._id } }
    );

    await Progress.deleteMany({ moduleId: updatedModule._id });


    res.status(200).json(updatedModule);
  } catch (error) {
    console.error('Error archiving module:', error);
    res.status(500).json({ error: 'Error archiving module' });
  }
};


export const archiveUnit = async (req, res) => {
  try {
    const { id } = req.params;

    // Archive Course Section
    const updatedUnit = await Unit.findByIdAndUpdate(
      id,
      { archived: true },
      { new: true }
    );

  // do the same for tool group and practical group

  await Progress.deleteMany({ unitId: updatedUnit._id });

    res.status(200).json(updatedUnit);
  } catch (error) {
    console.error('Error archiving unit:', error);
    res.status(500).json({ error: 'Error archiving unit' });
  }
};