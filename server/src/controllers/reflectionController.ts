
import { Request, Response } from 'express';
import Reflection from '../models/Reflection';

// Get all reflections
export const getAllReflections = async (req: Request, res: Response): Promise<void> => {
  try {
    const reflections = await Reflection.find();
    res.status(200).json(reflections);
  } catch (error) {
    console.error('Error fetching reflections:', error);
    res.status(500).json({ message: 'Error fetching reflections', error });
  }
};

// Get a single reflection by ID
export const getReflectionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const reflection = await Reflection.findOne({ id: req.params.id });
    if (!reflection) {
      res.status(404).json({ message: 'Reflection not found' });
      return;
    }
    res.status(200).json(reflection);
  } catch (error) {
    console.error('Error fetching reflection:', error);
    res.status(500).json({ message: 'Error fetching reflection', error });
  }
};

// Create a new reflection
export const createReflection = async (req: Request, res: Response): Promise<void> => {
  try {
    const newReflection = new Reflection(req.body);
    const savedReflection = await newReflection.save();
    res.status(201).json(savedReflection);
  } catch (error) {
    console.error('Error creating reflection:', error);
    res.status(500).json({ message: 'Error creating reflection', error });
  }
};

// Update an existing reflection
export const updateReflection = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedReflection = await Reflection.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedReflection) {
      res.status(404).json({ message: 'Reflection not found' });
      return;
    }
    res.status(200).json(updatedReflection);
  } catch (error) {
    console.error('Error updating reflection:', error);
    res.status(500).json({ message: 'Error updating reflection', error });
  }
};

// Delete a reflection
export const deleteReflection = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedReflection = await Reflection.findOneAndDelete({ id: req.params.id });
    if (!deletedReflection) {
      res.status(404).json({ message: 'Reflection not found' });
      return;
    }
    res.status(200).json({ message: 'Reflection deleted successfully' });
  } catch (error) {
    console.error('Error deleting reflection:', error);
    res.status(500).json({ message: 'Error deleting reflection', error });
  }
};
