import { Injectable, BadRequestException, Res ,NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resume } from './schemas/resume.schema';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

@Injectable()
export class ResumeService {

  constructor(@InjectModel(Resume.name) private resumeModel: Model<Resume>) {}

  async updateResume(request: AuthenticatedRequest, field: string, value: any) {
    const allowedFields = [
      "personalDetails",
      "briefDescription",
      "workExperience",
      "education",
      "projects",
      "skills",
      "achievements",
      "certificates",
      "codingProfiles",
      "customSection",
      "extraCurricularActivities"
    ];
    if (!allowedFields.includes(field)) {
      throw new BadRequestException(`Invalid field: ${field}`);
    }
  
    const userId = request.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
  
    // For simple fields, unwrap expected property:
    if (field === 'briefDescription') {
      value = value.description;
    }
  
    if (field === 'skills') {
      // If value is already an array, use it directly.
      if (Array.isArray(value)) {
        // Nothing to do.
      } else if (value && typeof value === "object" && Array.isArray(value.skills)) {
        value = value.skills;
      } else {
        throw new BadRequestException("Invalid format for skills.");
      }
    }
    
    return this.resumeModel.findOneAndUpdate(
      { userId }, 
      { 
        $set: { [field]: value }, 
      }, 
      { 
        new: true,  // Return updated document
        upsert: true // Create if not exists
      }
    );
    // let resume = await this.resumeModel.findOne({ userId });
  
    // if (resume) {
    //   resume[field] = value;
    //   return resume.save();
    // } 
    // else {
    //   return this.resumeModel.create({
    //     userId,
    //     personalDetails: { email: userEmail },
    //     [field]: value,
    //   });
    // }
  }
  

  async getResumeField(request: AuthenticatedRequest, field: string) {

    const allowedFields = [
      "personalDetails",
      "briefDescription",
      "workExperience",
      "education",
      "projects",
      "skills",
      "achievements",
      "certificates",
      "codingProfiles",
      "customSection",
      "extraCurricularActivities"
    ];

    if (!allowedFields.includes(field)) {
      throw new BadRequestException(`Invalid field: ${field}`);
    }

    const userId = request.user?.id; 
    console.log(request.user);
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const resume = await this.resumeModel.findOne({ userId });

    if (resume) {
      return resume[field];
    } 
  }

  async updateResumeEntry(request: AuthenticatedRequest, field: string, id: number, data: any) {

    const allowedFields = ["workExperience", "education", "projects"];

    if (!allowedFields.includes(field)) {
      throw new BadRequestException(`Invalid field: ${field}`);
    }

    const userId = request.user?.id;
    
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const resume = await this.resumeModel.findOne({ userId });

    if (resume && resume[field] && Array.isArray(resume[field])) {
      resume[field][id] = { ...resume[field][id], ...data };
      return resume.save();
    } else {
      throw new BadRequestException('Resume or field not found');
    }
  }

  async deleteResumeEntry(request: AuthenticatedRequest, field: string, id: number) {

    const allowedFields = ["workExperience", "education", "projects", "achievements","certificates","codingProfiles","extraCurricularActivities"];
    if (!allowedFields.includes(field)) {
      throw new BadRequestException(`Invalid field: ${field}`);
    }
  
    const userId = request.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
  
    const resume = await this.resumeModel.findOne({ userId });
    if (resume && resume[field] && Array.isArray(resume[field])) {
      resume[field].splice(id, 1);
      return resume.save();
    } else {
      throw new BadRequestException('Resume or field not found');
    }
  }


  //Get resume data using id 
  async getUserResume(userId: string): Promise<Resume> {
    // console.log("very very sad")
    const resume = await this.resumeModel.findOne({ userId });

    if (!resume) {
        throw new NotFoundException("Resume not found for this user");
    }

    return resume;
}
  
}