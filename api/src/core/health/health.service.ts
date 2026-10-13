import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getLiveStatus(): {
    status: string;
  } {
    return {
      status: 'UP',
    };
  }
}