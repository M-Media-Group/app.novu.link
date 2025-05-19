// src/services/api/httpClient.ts
export interface HttpClient {
  get<T>(url: string, options?: object): Promise<T>;
  post<T>(url: string, data?: any, options?: object): Promise<T>;
  put<T>(url: string, data?: any, options?: object): Promise<T>;
  delete<T>(url: string, options?: object): Promise<T>;
}
