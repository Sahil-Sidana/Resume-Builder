import React, { useState } from 'react';
import { Box, TextField, Button, Grid2 } from '@mui/material';
import EducationEntry from './EducationEntry';
import useResumeStore from '../../../app/ResumeStore';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ToastTheme from '../../../utils/ToastTheme';
import {EducationSchema} from '../../../schemas/EducationSchema';

export default function Education() {
  const education = useResumeStore((state) => state.resume.education); 
  const addResumeEntry = useResumeStore((state) => state.addResumeEntry); 

  const [newEducation, setNewEducation] = useState({
    degreeName: '',
    institutionName: '',
    yearOfGraduation: '',
    cgpa: '',
  });

  const handleChange = (event) => {
    setNewEducation({
      ...newEducation,
      [event.target.name]: event.target.value,
    });
  };

  const handleAdd = () => {
    if (!newEducation.degreeName || !newEducation.institutionName || !newEducation.yearOfGraduation || !newEducation.cgpa) {
      toast.error("Please fill all mandatory fields (marked as required) to save details.", ToastTheme);
      return;
    }
    if (newEducation.yearOfGraduation < 1900 || newEducation.yearOfGraduation > new Date().getFullYear() + 5) {
      toast.error("Invalid year of graduation", ToastTheme);
      return;
    }
    if (newEducation.cgpa < 0 || newEducation.cgpa > 100) {
      toast.error("Invalid CGPA/Percentage", ToastTheme);
      return;
    }

    addResumeEntry("education", { ...newEducation });
    toast.success("Education details added successfully!", ToastTheme);
    setNewEducation({ degreeName: '', institutionName: '', yearOfGraduation: '', cgpa: '' });
  };

  return (
    <Box>
      <Grid2 container spacing={2}>
        <Grid2 item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Degree Name"
            name="degreeName"
            value={newEducation.degreeName}
            onChange={handleChange}
          />
        </Grid2>
        <Grid2 item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Institution Name"
            name="institutionName"
            type="text"
            value={newEducation.institutionName}
            onChange={handleChange}
          />
        </Grid2>
        <Grid2 item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Year of Graduation"
            name="yearOfGraduation"
            type="number"
            value={newEducation.yearOfGraduation}
            onChange={handleChange}
          />
        </Grid2>
        <Grid2 item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="CGPA/Percentage"
            name="cgpa"
            type="number"
            value={newEducation.cgpa}
            onChange={handleChange}
          />
        </Grid2>
        <Grid2 item xs={12}>
          <Button variant="contained" onClick={handleAdd}>
            Add Education
          </Button>
        </Grid2>
      </Grid2>

      {education
      .filter((edu) => edu.degreeName && edu.institutionName && edu.yearOfGraduation && edu.cgpa)
      .map((edu, index) => (
        <EducationEntry
          key={`${edu.degreeName}-${edu.institutionName}-${index}`}
          index={index}
          education={edu}
        />
      ))}
    </Box>
  );
}
