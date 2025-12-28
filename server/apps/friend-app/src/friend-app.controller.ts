import { Controller, Get } from '@nestjs/common';
import { FriendAppService } from './friend-app.service';

@Controller()
export class FriendAppController {
  constructor(private readonly friendAppService: FriendAppService) {}

  @Get('health')
  healthCheck() {
    return this.friendAppService.healthCheck();
  }
}
