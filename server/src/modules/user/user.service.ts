import { BaseService } from '@core/base.service';
import { UserRepository } from './user.repository';
import { NotFoundError } from '@core/errors';
import { UpdateUserInput } from './user.schema';

export class UserService extends BaseService {
  private userRepo: UserRepository;

  constructor() {
    super();
    this.userRepo = new UserRepository();
  }

  async getProfile(userId: string) {
    try {
      const user = await this.userRepo.findByIdWithProfile(userId);
      if (!user) throw new NotFoundError('User', userId);
      return user;
    } catch (error) {
      this.handleError(error, 'Failed to get user profile');
    }
  }

  async updateProfile(userId: string, data: UpdateUserInput) {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) throw new NotFoundError('User', userId);
      return await this.userRepo.update(userId, data);
    } catch (error) {
      this.handleError(error, 'Failed to update user profile');
    }
  }
}
