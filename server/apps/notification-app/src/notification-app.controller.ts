import { Controller, Get } from '@nestjs/common';
import { NotificationAppService } from './notification-app.service';

@Controller()
export class NotificationAppController {
  constructor(private readonly notificationAppService: NotificationAppService) {}

  @Get('health')
  healthCheck() {
    return this.notificationAppService.healthCheck();
  }
}
