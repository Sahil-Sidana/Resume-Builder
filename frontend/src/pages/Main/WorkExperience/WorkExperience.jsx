import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material'; 
import useResumeStore from '../../../app/ResumeStore';
import WorkExperienceEntry from './WorkExperienceEntry';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ToastTheme from '../../../utils/ToastTheme';
import { WorkExperienceSchema } from '../../../schemas/WorkExperienceSchema';

export default function WorkExperience() {
  const workExperience = useResumeStore((state) => state.resume.workExperience);
  const addResumeEntry = useResumeStore((state) => state.addResumeEntry);

  const [currentExperience, setCurrentExperience] = useState({
    jobTitle: '',
    companyName: '',
    startDate: '',
    endDate: '',
    responsibilities: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    setCurrentExperience({
      ...currentExperience,
      [event.target.name]: event.target.value,
    });
  };

  const checkOverlap = (newExperience) => {
    return workExperience.some(exp => {
      const existingStart = new Date(exp.startDate);
      const existingEnd = exp.endDate ? new Date(exp.endDate) : new Date();
      const newStart = new Date(newExperience.startDate);
      const newEnd = newExperience.endDate ? new Date(newExperience.endDate) : new Date();

      return (newStart <= existingEnd && newEnd >= existingStart);
    });
  };

  const handleSave = async () => {
    try {
      await WorkExperienceSchema.validate(currentExperience, { abortEarly: false });
      if (currentExperience.endDate && currentExperience.startDate > currentExperience.endDate) {
        throw new Error("End date cannot be before start date");
      }
      if (checkOverlap(currentExperience)) {
        throw new Error("Work experience duration overlaps with an existing entry");
      }
      setErrors({});
      addResumeEntry('workExperience', currentExperience);
      setCurrentExperience({
        jobTitle: '',
        companyName: '',
        startDate: '',
        endDate: '',
        responsibilities: '',
      });
      toast.success("Experience added successfully!", { ...ToastTheme, progress: undefined });
    } catch (err) {
      const newErrors = {};
      if (err.inner !== undefined) {
        err.inner.forEach((e) => {
          if (newErrors[e.path] === undefined) newErrors[e.path] = e.message;
        });
      }
      if (currentExperience.startDate && currentExperience.endDate && currentExperience.startDate > currentExperience.endDate) {
        newErrors.endDate = "End date cannot be before start date";
      }
      if (err.message === "Work experience duration overlaps with an existing entry") {
        toast.error(err.message, { ...ToastTheme, progress: undefined });
      }
      setErrors(newErrors);
    }
  };

  return (
    <>
    <Box className="max-w-xl mx-auto p-4 space-y-6 bg-white rounded-lg shadow-md">
      <Typography variant="h5" sx={{ fontWeight: 600, marginBottom: 2, textAlign: 'center' }}>
        Work Experience
      </Typography>
      <Box>
        <TextField
          required
          error={!!errors.jobTitle}
          helperText={errors.jobTitle}
          fullWidth
          label="Job Title"
          name="jobTitle"
          value={currentExperience.jobTitle}
          onChange={handleChange}
          sx={{ marginBottom: 2 }}
        />
      </Box>

      <Box>
        <TextField
          required
          error={!!errors.companyName}
          helperText={errors.companyName}
          fullWidth
          label="Company Name"
          name="companyName"
          value={currentExperience.companyName}
          onChange={handleChange}
          sx={{ marginBottom: 2 }}
        />
      </Box>

      <Box display="flex" gap={2}>
        <Box flex={1}>
          <TextField
            fullWidth
            error={!!errors.startDate}
            helperText={errors.startDate}
            label="Start Date"
            name="startDate"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={currentExperience.startDate}
            onChange={handleChange}
            sx={{ marginBottom: 2 }}
          />
        </Box>
        <Box flex={1}>
          <TextField
            fullWidth
            error={!!errors.endDate}
            helperText={errors.endDate}
            label="End Date"
            name="endDate"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={currentExperience.endDate}
            onChange={handleChange}
            sx={{ marginBottom: 2 }}
          />
        </Box>
      </Box>
      <Box>
        <TextField
          fullWidth
          multiline
          rows={4}
          error={!!errors.responsibilities}
          helperText={errors.responsibilities}
          label="Responsibilities"
          name="responsibilities"
          value={currentExperience.responsibilities}
          onChange={handleChange}
          sx={{ marginBottom: 2 }}
        />
      </Box>
      <Box textAlign="center">
        <Button
          variant="contained"
          color="primary"
          sx={{
            width: '50%', 
            margin: '0 auto',
            display: 'block', 
            marginTop: 2, 
            padding: '10px 20px',
            borderRadius: '8px', 
          }}
          onClick={handleSave}
        >
          Add Experience
        </Button>
      </Box>
    </Box>  

      <Box mt={4} className="max-w-xl mx-auto p-4 space-y-6 bg-white rounded-lg shadow-md">
        <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 2 }}>
          Previously Added Work Experiences
        </Typography>
        {workExperience
          .filter((exp) => exp.jobTitle.trim() !== '' && exp.companyName.trim() !== '')
          .map((exp, index) => (
            <WorkExperienceEntry
              key={`${exp.jobTitle}-${exp.companyName}-${index}`}
              experience={exp}
              index={index}
            />
          ))}
      </Box>
      </>
  );
}