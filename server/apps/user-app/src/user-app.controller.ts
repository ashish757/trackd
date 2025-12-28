import { Controller, Get } from '@nestjs/common';
import { UserAppService } from './user-app.service';

@Controller()
export class UserAppController {
  constructor(private readonly userAppService: UserAppService) {}
  @Get('health')
  healthCheck() {
    return this.userAppService.healthCheck();
  }
}
