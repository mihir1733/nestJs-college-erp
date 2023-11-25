import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Attendance, AttendanceDocument } from './attendance.schema';
import { Aggregate, Model, Types } from 'mongoose';
import { CreateAttendanceDto } from './dtos/create-attendance.dto';
import { UpdateAttendanceDto } from './dtos/update-attendance.dto';

export type randomMatch = {
  batch?: number;
  department?: string;
  currentSemester?: number;
};

export type AbsentStudentsAnalyticsResult = {
  studentInfo: {
    _id: string;
    name: string;
    phoneNumber: number;
    department: string;
    batch: number;
    currentSemester: number;
  };
};

export type AttendanceAnalyticsResult = {
  presentDays: number;
  totalDays: number;
  attendancePercentage: number;
  studentInfo: {
    _id: string;
    name: string;
    phoneNumber: number;
    department: string;
    batch: number;
    currentSemester: number;
  };
};

@Injectable()
export class AttendancesRepository {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>,
  ) {}

  /**
   * Create a new attendance entry.
   * @param {CreateAttendanceDto} attendanceBody - The attendance data to create.
   * @returns {Promise<AttendanceDocument>} - The created attendance entry.
   */
  createAttendance(
    attendanceBody: CreateAttendanceDto,
  ): Promise<AttendanceDocument> {
    return this.attendanceModel.create(attendanceBody);
  }

  /**
   * Find an attendance entry by its ID.
   * @param {Types.ObjectId} id - The ID of the attendance entry to retrieve.
   * @returns {Promise<AttendanceDocument>} - The attendance entry with the specified ID.
   */
  findAttendance(id: Types.ObjectId): Promise<AttendanceDocument> {
    return this.attendanceModel.findById(id);
  }

  /**
   * Find all attendance entries.
   * @returns {Promise<AttendanceDocument[]>} - An array of attendance entries.
   */
  findAttendances(): Promise<AttendanceDocument[]> {
    return this.attendanceModel.find();
  }

  /**
   * Find all attendance entries for a specific student.
   * @param {Types.ObjectId} studentId - The ID of the student to retrieve attendance for.
   * @returns {Promise<AttendanceDocument[]>} - An array of attendance entries for the specified student.
   */
  findAttendancesOfStudent(
    studentId: Types.ObjectId,
  ): Promise<AttendanceDocument[]> {
    return this.attendanceModel.find({ student: studentId });
  }

  /**
   * Delete an attendance entry by its ID.
   * @param {Types.ObjectId} id - The ID of the attendance entry to delete.
   * @returns {Promise<AttendanceDocument>} - The deleted attendance entry.
   */
  deleteAttendance(id: Types.ObjectId): Promise<AttendanceDocument> {
    return this.attendanceModel.findByIdAndDelete(id);
  }

  /**
   * Find and update an attendance entry by its ID.
   * @param {Types.ObjectId} id - The ID of the attendance entry to update.
   * @param {UpdateAttendanceDto} attendanceBody - The attendance data to update.
   * @returns {Promise<AttendanceDocument>} - The updated attendance entry.
   */
  findAndUpdateAttendance(
    id: Types.ObjectId,
    attendanceBody: UpdateAttendanceDto,
  ): Promise<AttendanceDocument> {
    return this.attendanceModel.findByIdAndUpdate(id, attendanceBody, {
      new: true,
    });
  }

  /**
   * Find absent students' analytics for a specific date and matching criteria.
   * @param {string} date - The date to analyze.
   * @param {randomMatch} match - The matching criteria for students.
   * @returns {Aggregate<AbsentStudentsAnalyticsResult[]>} - An aggregation result of absent students' analytics.
   */
  findAbsentStudentsAnalytics(
    date: string,
    match?: randomMatch,
  ): Aggregate<AbsentStudentsAnalyticsResult[]> {
    const { batch, department, currentSemester } = match;

    return this.attendanceModel.aggregate([
      {
        $match: {
          date: new Date(date),
          isPresent: false,
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      {
        $unwind: '$studentInfo',
      },
      {
        $match: {
          $and: [
            batch ? { 'studentInfo.batch': batch } : {},
            department ? { 'studentInfo.department': department } : {},
            currentSemester
              ? { 'studentInfo.currentSemester': currentSemester }
              : {},
          ],
        },
      },
      {
        $project: {
          _id: 0,
          student: 0,
          date: 0,
          isPresent: 0,
          __v: 0,
          'studentInfo.__v': 0,
        },
      },
    ]);
  }

  /**
   * Find students with less than 75% attendance for a specific date and matching criteria.
   * @param {string} date - The date to analyze.
   * @param {randomMatch} match - The matching criteria for students.
   * @returns {Aggregate<AttendanceAnalyticsResult[]>} - An aggregation result of students with less than 75% attendance.
   */
  findLessAttendanceStudents(
    date: string,
    match: randomMatch,
  ): Aggregate<AttendanceAnalyticsResult[]> {
    return this.attendanceModel.aggregate([
      {
        $match: {
          date: {
            $lte: new Date(date as string),
          },
        },
      },
      {
        $group: {
          _id: '$student',
          presentDays: {
            $sum: {
              $cond: {
                if: { $eq: ['$isPresent', true] },
                then: 1,
                else: 0,
              },
            },
          },
          totalDays: {
            $sum: 1,
          },
        },
      },
      {
        $addFields: {
          attendancePercentage: {
            $multiply: [{ $divide: ['$presentDays', '$totalDays'] }, 100],
          },
        },
      },
      {
        $match: {
          attendancePercentage: {
            $lt: 75,
          },
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      {
        $match: {
          studentInfo: {
            $elemMatch: match,
          },
        },
      },
      {
        $unwind: '$studentInfo',
      },
      {
        $project: {
          _id: 0,
          totalDays: 1,
          presentDays: 1,
          attendancePercentage: 1,
          studentInfo: 1,
        },
      },
    ]);
  }

  clearDB() {
    return this.attendanceModel.deleteMany();
  }
}
