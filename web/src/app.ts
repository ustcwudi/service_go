import { RequestConfig } from 'umi';
import errorHandler from '@/util/errorHandle';

export const request: RequestConfig = {
  prefix: '',
  credentials: 'include',
  errorHandler,
  errorConfig: {
    adaptor: res => {
      return {
        success: res.success,
        data: res.data,
        errorCode: res.code,
        errorMessage: res.message,
      };
    },
  },
};
