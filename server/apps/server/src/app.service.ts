import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    async detectCountry(req) {
        // Call API to detect country with IP
        return "IN"
    }
}
