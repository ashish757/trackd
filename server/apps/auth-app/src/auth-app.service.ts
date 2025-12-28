import {HttpStatus, Injectable} from '@nestjs/common';

@Injectable()
export class AuthAppService {
  healthCheck() {
    return {
      name: 'Auth Service!',
      status: 'ok',
      statusCode: HttpStatus.OK,
      message: 'Service is Healthy',
    };
  }
}
