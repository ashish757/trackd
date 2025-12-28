import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';

/**
 * Global module for email service
 * Available across all microservices without explicit import
 */
@Global()
@Module({
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule {}

