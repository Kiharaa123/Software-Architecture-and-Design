import { UserDto } from '../user/user.dto';

export class LoginOutput {
  user: UserDto;
  accessToken: string;
  refreshToken: string;
}

export class LoginInput {
  email: string;
  password: string;
  redirect?: boolean;
}
