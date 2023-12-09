import axios, { AxiosInstance } from 'axios';
import logger from './logger.manager';

export const headers = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
};

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create();
    this.axiosInstance.defaults.headers.common = headers;
    this.axiosInstance.interceptors.request.use((request) => {
      logger.debug(`Starting Request request headers:${request.headers}`);
      logger.debug(`Starting Request request url:${request.url}`);
      return request;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => {
        logger.debug(`Response : ${response?.data}`);
        return response;
      },
      (error) => {
        logger.error(error);
        return Promise.reject(error);
      },
    );
  }

  public get<T>(url: string, config?: unknown): Promise<T> {
    return this.axiosInstance.get(url, config).then((response) => response.data);
  }

  public post<T>(url: string, data: unknown, config?: unknown): Promise<T> {
    return this.axiosInstance.post(url, data, config).then((response) => response.data);
  }
}

export const apiClient = new ApiClient();
