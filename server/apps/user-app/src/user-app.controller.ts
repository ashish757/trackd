import { Controller, Get } from '@nestjs/common';
import { UserAppService } from './user-app.service';

@Controller()
export class UserAppController {
  constructor(private readonly userAppService: UserAppService) {}

  @Get()
  getHello(): string {
    return this.userAppService.getHello();
  }
}
