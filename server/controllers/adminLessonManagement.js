import { ToolGroup, PracticalGroup, Tool } from "../models/Content.js";
import { updateProgressForAll } from "./progress.js";

import { generateUploadObjectURL } from "../s3.js";


// CREATE
// NO ADDING OF IMAGE YET

export const addToolGroup = async (req, res) => {
    try {
        const { courseSectionId, courseId, moduleId, unitId, title, image } = req.body;
        const newToolGroup = new ToolGroup({ 
            courseSectionId,
            courseId,
            moduleId, 
            unitId,
            title,
            image: image || null
        });
        const savedToolGroup = await newToolGroup.save();
        await updateProgressForAll(unitId);
        res.status(201).json(savedToolGroup);
      } catch (error) {
        console.error('Error adding tool group:', error.message);
        res.status(500).json({ error: 'Error adding course' });
    }
}

export const addPracticalGroup = async (req, res) => {
    try {
        const { courseSectionId, courseId, moduleId, unitId, title, simulationPath, image} = req.body;
        const newPracticalGroup = new PracticalGroup({ 
            courseSectionId,
            courseId,
            moduleId, 
            unitId,
            title, 
            image: image || null,
            simulationPath
         });
        const savedPracticalGroup = await newPracticalGroup.save();
        await updateProgressForAll(unitId);
        res.status(201).json(savedPracticalGroup);
      } catch (error) {
        console.error('Error adding practical group:', error.message);
        res.status(500).json({ error: 'Error adding practical group' });
    }
}

// NO MODEL PATH YET 

export const addTool = async (req, res) => {
    try {
      const { courseSectionId, courseId, moduleId, unitId, toolGroupId, name, description, modelPath } = req.body;
      
      // Create a new tool
      const newTool = new Tool({
        courseSectionId,
        courseId,
        moduleId,
        unitId,
        toolGroupId,
        name,
        description, 
        modelPath
      });
  
      // Save the new tool
      const savedTool = await newTool.save();
  
      // Update the corresponding ToolGroup document's tools array
      await ToolGroup.findByIdAndUpdate(
        toolGroupId,
        { $push: { tools: savedTool } }, // Push the entire savedTool object to the tools array
        { new: true, useFindAndModify: false }
      );
  
      // Send response with the saved tool
      res.status(201).json(savedTool);
    } catch (error) {
      console.error('Error adding tool:', error.message);
      res.status(500).json({ error: 'Error adding tool' });
    }
};

// RETRIEVE

export const uploadObject = async (req, res) => {
    try {
        const { extension } = req.query;
        const url = await generateUploadObjectURL(extension);
        res.send({ url });
    } catch (err) {
        console.error("Error getting object:", err.message);
        res.status(500).json({ message: "Error getting object", error: err.message })
    }
}

export const getAllToolGroups = async (req, res) => {
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


        const toolGroups = await ToolGroup.find(query)
            .populate('unitId', 'title') // Populate the unitId field with the title from the Unit model
            .populate('moduleId', 'title')
            .populate('courseId', 'title')
            .populate('courseSectionId', 'title')
            .exec();

        const totalCount = await ToolGroup.countDocuments(query);


        res.status(200).json({
          toolGroups,
          totalCount
        });
    } catch (error) {
        console.error('Error fetching tool groups:', error);
        res.status(500).json({ error: 'Error fetching tool groups' });
    }
}

export const getAllPracticalGroups = async (req, res) => {
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


        const practicalGroups = await PracticalGroup.find(query)
            .populate('unitId', 'title') // Populate the unitId field with the title from the Unit model
            .populate('moduleId', 'title')
            .populate('courseId', 'title')
            .populate('courseSectionId', 'title')
            .exec();

        const totalCount = await PracticalGroup.countDocuments(query);


        res.status(200).json({
          practicalGroups,
          totalCount
        });
    } catch (error) {
        console.error('Error fetching practical groups:', error);
        res.status(500).json({ error: 'Error fetching practical groups' });
    }
}


export const getAllTools = async (req, res) => {
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


        const tools = await Tool.find(query)
            .populate('toolGroupId', 'title')
            .populate('unitId', 'title') // Populate the unitId field with the title from the Unit model
            .populate('moduleId', 'title')
            .populate('courseId', 'title')
            .populate('courseSectionId', 'title')
            .exec();

        const totalCount = await Tool.countDocuments(query);


        res.status(200).json({
          tools,
          totalCount
        });
    } catch (error) {
        console.error('Error fetching tools:', error);
        res.status(500).json({ error: 'Error fetching tools' });
    }
}

// UPDATE
// NO ARCHIVE YET

// WHEN UNITID OF TOOL GROUP AND PRACTICAL GROUP IS EDITED, UPDATE PROGRESS

export const editToolGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, unitId, moduleId, courseId, courseSectionId, image, archived } = req.body;

        // Fetch the current tool group to get the current unitId and archived status
        const currentToolGroup = await ToolGroup.findById(id);
        if (!currentToolGroup) {
            return res.status(404).json({ error: 'Tool Group not found' });
        }

        const formerUnitId = currentToolGroup.unitId;
        const formerArchived = currentToolGroup.archived;

        // Update the tool group
        const updatedToolGroup = await ToolGroup.findByIdAndUpdate(id, { title, unitId, moduleId, courseId, courseSectionId, image, archived }, { new: true });
        if (!updatedToolGroup) {
            return res.status(404).json({ error: 'Tool Group not found' });
        }

        // Fetch tools associated with the tool group
        const toolsToUpdate = await Tool.find({ toolGroupId: id });

        await Promise.all(toolsToUpdate.map(async (tool) => {
            tool.courseSectionId = courseSectionId;
            tool.courseId = courseId;
            tool.moduleId = moduleId;
            tool.unitId = unitId;
            await tool.save();
        }));



        // If the archived status has changed, handle archiving
        
        // if (archived) {
        //         // Archive all related tools
        //     await Promise.all(toolsToUpdate.map(async (tool) => {
        //         tool.archived = true;
        //         await tool.save();
        //         await updateProgressForAll(unitId, id); // Archive case
        //     }));
        // } else {
        //     await Promise.all(toolsToUpdate.map(async (tool) => {
        //         await updateProgressForAll(unitId, null, id);
        //     }));
        // }

        if (formerArchived !== archived) {
            if (archived) {
                await updateProgressForAll(unitId, id);
            } else {
                await updateProgressForAll(unitId, null, id); // Unarchive case
            }
        }

        // If the unit has changed, update the progress
        if (formerUnitId.toString() !== unitId.toString()) {
            await updateProgressForAll(formerUnitId, id); // Remove from former unit's progress
            await updateProgressForAll(unitId);
        }

        res.status(200).json({ message: 'Tool Group updated successfully and progress updated if needed.' });
    } catch (error) {
        console.error('Error updating tool group:', error.message);
        res.status(500).json({ error: 'An error occurred while updating the tool group.' });
    }
};




export const editPracticalGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, unitId, moduleId, courseId, courseSectionId, image, simulationPath, archived } = req.body;

        const currentPracticalGroup = await PracticalGroup.findById(id);
        if (!currentPracticalGroup) {
            return res.status(404).json({ error: 'Practical Group not found' });
        }

        const formerUnitId = currentPracticalGroup.unitId;
        const formerArchived = currentPracticalGroup.archived;

        // Update the practical group
        const updatedPracticalGroup = await PracticalGroup.findByIdAndUpdate(id, { title, unitId, moduleId, courseId, courseSectionId, image, simulationPath, archived }, { new: true });
        if (!updatedPracticalGroup) {
            return res.status(404).json({ error: 'Practical Group not found' });
        }

        // Handle archived status changes for progress updates
        if (formerArchived !== archived) {
            if (archived) {
                await updateProgressForAll(unitId, id);
            } else {
                await updateProgressForAll(unitId, null, id); // Unarchive case
            }
        }

        // If the unit has changed, update the progress
        if (formerUnitId.toString() !== unitId.toString()) {
            await updateProgressForAll(formerUnitId, id); // Remove from former unit's progress
            await updateProgressForAll(unitId);
        }

        res.status(200).json(updatedPracticalGroup);
    } catch (error) {
        console.error('Error updating practical group:', error.message);
        res.status(500).json({ error: 'An error occurred while updating the practical group.' });
    }
};




export const editTool = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, toolGroupId, unitId, moduleId, courseId, courseSectionId, modelPath, archived } = req.body;

        const currentTool = await Tool.findById(id);
        if (!currentTool) {
            return res.status(404).json({ error: 'Tool not found' });
        }

        const formerToolGroupId = currentTool.toolGroupId;

        // Update the tool
        const updatedTool = await Tool.findByIdAndUpdate(id, {
            name, description, toolGroupId, unitId, moduleId, courseId, courseSectionId, modelPath, archived
        }, { new: true });

        if (!updatedTool) {
            return res.status(404).json({ error: 'Tool not found' });
        }

        // If toolGroupId has changed, update the tool group's tools array
        if (formerToolGroupId.toString() !== toolGroupId) {
            await ToolGroup.findByIdAndUpdate(formerToolGroupId, {
                $pull: { tools: { _id: id } }
            });

            await ToolGroup.findByIdAndUpdate(toolGroupId, {
                $push: { tools: updatedTool.toObject() }
            });
        }

        // Handle archived status changes
        if (archived !== currentTool.archived) {
            const toolGroup = await ToolGroup.findById(toolGroupId);
            if (toolGroup) {
                toolGroup.tools = toolGroup.tools.map(tool => 
                    tool._id.toString() === id ? { ...tool.toObject(), archived } : tool
                );
                await toolGroup.save();
            }
        }

        // Update tool's related properties
        updatedTool.courseSectionId = courseSectionId;
        updatedTool.courseId = courseId;
        updatedTool.moduleId = moduleId;
        updatedTool.unitId = unitId;
        await updatedTool.save();

        res.status(200).json(updatedTool);
    } catch (error) {
        console.error('Error updating tool:', error.message);
        res.status(500).json({ error: 'An error occurred while updating the tool.' });
    }
};


export const archiveToolGroup = async (req, res) => {
    try {
        const { id } = req.params;

        // Archive Tool Group
        const updatedToolGroup = await ToolGroup.findByIdAndUpdate(
            id,
            { archived: true },
            { new: true }
        );

        if (!updatedToolGroup) {
            return res.status(404).json({ error: 'Tool Group not found' });
        }

        // Archive associated Tools
        await Tool.updateMany(
            { toolGroupId: updatedToolGroup._id },
            { archived: true }
        );

        // Update progress for all users
        await updateProgressForAll(updatedToolGroup.unitId, updatedToolGroup._id);
        await updateProgressForAll(updatedToolGroup.unitId);

        res.status(200).json(updatedToolGroup);
    } catch (error) {
        console.error('Error archiving tool group:', error);
        res.status(500).json({ error: 'Error archiving tool group' });
    }
};


export const archivePracticalGroup = async (req, res) => {
    try {
        const { id } = req.params;

        // Archive Tool Group
        const updatedPracticalGroup = await PracticalGroup.findByIdAndUpdate(
            id,
            { archived: true },
            { new: true }
        );

        if (!updatedPracticalGroup) {
            return res.status(404).json({ error: 'Practical Group not found' });
        }

        // Update progress for all users
        await updateProgressForAll(updatedPracticalGroup.unitId, updatedPracticalGroup._id);
        await updateProgressForAll(updatedPracticalGroup.unitId);

        res.status(200).json(updatedPracticalGroup);
    } catch (error) {
        console.error('Error archiving practical group:', error);
        res.status(500).json({ error: 'Error archiving practical group' });
    }
};


export const archiveTool = async (req, res) => {
    try {
        const { id } = req.params;

        // Archive Tool
        const updatedTool = await Tool.findByIdAndUpdate(
            id,
            { archived: true },
            { new: true }
        );

        if (!updatedTool) {
            return res.status(404).json({ error: 'Tool not found' });
        }

        const { toolGroupId } = updatedTool;

        // Find the Tool Group that contains the Tool
        const toolGroup = await ToolGroup.findById(toolGroupId);

        if (!toolGroup) {
            return res.status(404).json({ error: 'Tool Group not found' });
        }

        // Update the 'archived' status of the Tool within the Tool Group's tools array
        toolGroup.tools = toolGroup.tools.map(tool => 
            tool._id.toString() === id ? { ...tool.toObject(), archived: true } : tool
        );

        await toolGroup.save();

        res.status(200).json(updatedTool);
    } catch (error) {
        console.error('Error archiving tool:', error);
        res.status(500).json({ error: 'Error archiving tool' });
    }
};
