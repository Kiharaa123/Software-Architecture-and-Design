import { UserDto } from '../user/user.dto';

export class CustomerDto {
  id: string;
  userId: string;
  user: UserDto;
  createdAt?: Date;
  updatedAt?: Date;
}
