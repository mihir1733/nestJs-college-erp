import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { hash } from 'bcrypt';
import { UserRepository } from './users.repository';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserDocument } from './user.schema';
import mongoose from 'mongoose';

@Injectable()
export class UsersService {
  constructor(private userRepo: UserRepository) {}

  /**
   * Create a new user.
   * @param {CreateUserDto} userBody - The data to create a user.
   * @returns {Promise<UserDocument>} - The created user.
   */
  async createUser(userBody: CreateUserDto): Promise<UserDocument> {
    try {
      const user = await this.userRepo.createUser(userBody);
      const hashedPassword = await hash(user.password, 8);
      user.password = hashedPassword;
      await user.save();
      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Find a user by email.
   * @param {string} email - The email of the user to find.
   * @returns {Promise<UserDocument>} - The found user.
   */
  async findUserByEmail(email: string): Promise<UserDocument> {
    try {
      const user = await this.userRepo.findUserByEmail(email);
      if (!user) throw new NotFoundException('user not found');
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Find all users.
   * @returns {Promise<UserDocument[]>} - A list of all users.
   */
  async findUsers(): Promise<UserDocument[]> {
    try {
      const users = await this.userRepo.findUsers();
      if (!users.length) throw new NotFoundException('users not found');
      return users;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Find a user by ID.
   * @param {string} id - The ID of the user to find.
   * @returns {Promise<UserDocument>} - The found user.
   */
  async findUserById(id: string): Promise<UserDocument> {
    try {
      const user = await this.userRepo.findUserById(
        new mongoose.Types.ObjectId(id),
      );
      if (!user) throw new NotFoundException('user not found');
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Update a user by ID.
   * @param {string} id - The ID of the user to update.
   * @param {UpdateUserDto} userBody - The data to update the user.
   * @returns {Promise<UserDocument>} - The updated user.
   */
  async updateUser(id: string, userBody: UpdateUserDto): Promise<UserDocument> {
    try {
      if (userBody.password) {
        userBody.password = await hash(userBody.password, 8);
      }
      const user = await this.userRepo.findUserAndUpdate(
        new mongoose.Types.ObjectId(id),
        userBody,
      );
      if (!user) throw new NotFoundException('user not found');
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Delete a user by ID.
   * @param {string} id - The ID of the user to delete.
   * @returns {Promise<UserDocument>} - The deleted user.
   */
  async deleteUser(id: string): Promise<UserDocument> {
    try {
      const user = await this.userRepo.deleteUser(
        new mongoose.Types.ObjectId(id),
      );
      if (!user) throw new NotFoundException('user not found');
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message);
    }
  }
}
