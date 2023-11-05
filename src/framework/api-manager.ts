import axios, { AxiosInstance, AxiosResponse } from "axios";
import logger from "./logger.manager";

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create();

    // Add response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        logger.error(error);
        return Promise.reject(error);
      }
    );
  }

  public get(url: string, config?: any): Promise<any> {
    return this.axiosInstance
      .get(url, config)
      .then((response) => response.data);
  }

  public post(url: string, data: any, config?: any): Promise<any> {
    return this.axiosInstance
      .post(url, data, config)
      .then((response) => response.data);
  }
}

export const apiClient = new ApiClient();
