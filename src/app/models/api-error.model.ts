export interface ApiError {
  status: number;
  code: string;
  message: string;
  timestamp?: string;
  path?: string;
}
