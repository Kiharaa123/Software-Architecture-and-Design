import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserInput, UserDto } from './user.dto';
import {
  ApiErrorResponse,
  ApiPostResponse,
} from 'src/common/decorators/api-response.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiPostResponse(UserDto, 'User created')
  @ApiOperation({ summary: 'Create user' })
  @ApiErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR)
  async createUser(@Body() input: CreateUserInput) {
    return this.userService.createUser(input);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('/needAuth')
  async needAuth() {
    return 'You need to be authenticated to access this route';
  }
}
