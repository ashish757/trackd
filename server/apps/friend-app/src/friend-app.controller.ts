import { Controller, Get } from '@nestjs/common';
import { FriendAppService } from './friend-app.service';

@Controller()
export class FriendAppController {
  constructor(private readonly friendAppService: FriendAppService) {}

  @Get()
  getHello(): string {
    return this.friendAppService.getHello();
  }
}
