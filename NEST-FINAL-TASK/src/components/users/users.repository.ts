import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  /**
   * Create a new user.
   * @param {CreateUserDto} userBody - The data to create a user.
   * @returns {Promise<UserDocument>} - The created user.
   */
  createUser(userBody: CreateUserDto): Promise<UserDocument> {
    return this.userModel.create(userBody);
  }

  /**
   * Find a user by email.
   * @param {string} email - The email of the user to find.
   * @returns {Promise<UserDocument>} - The found user.
   */
  findUserByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email });
  }

  /**
   * Find all users.
   * @returns {Promise<UserDocument[]>} - A list of all users.
   */
  findUsers(): Promise<UserDocument[]> {
    return this.userModel.find();
  }

  /**
   * Find a user by ID.
   * @param {Types.ObjectId} id - The ID of the user to find.
   * @returns {Promise<UserDocument>} - The found user.
   */
  findUserById(id: Types.ObjectId): Promise<UserDocument> {
    return this.userModel.findById(id);
  }

  /**
   * Delete a user by ID.
   * @param {Types.ObjectId} id - The ID of the user to delete.
   * @returns {Promise<UserDocument>} - The deleted user.
   */
  deleteUser(id: Types.ObjectId): Promise<UserDocument> {
    return this.userModel.findByIdAndDelete(id);
  }

  /**
   * Update a user by ID.
   * @param {Types.ObjectId} id - The ID of the user to update.
   * @param {UpdateUserDto} userBody - The data to update the user.
   * @returns {Promise<UserDocument>} - The updated user.
   */
  findUserAndUpdate(
    id: Types.ObjectId,
    userBody: UpdateUserDto,
  ): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(id, userBody, { new: true });
  }

  clearDB() {
    return this.userModel.deleteMany();
  }
}
