import type {
  ApiCodeResponse,
} from '../enum/index.js';

export interface ApiResponse<TData> {
  success: true;
  code: ApiCodeResponse;
  data: TData;
}