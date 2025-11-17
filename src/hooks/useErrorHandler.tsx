import { useCallback } from 'react';
import { toastError, toastSuccess, toastWarning, toastInfo } from '../components/Toast';
import { createLogger } from '../lib/logger';

const logger = createLogger('ErrorHandler');

interface ErrorInfo {
  message: string;
  code?: string;
  details?: unknown;
  action?: () => void;
}

export function useErrorHandler() {
  const handleError = useCallback((error: unknown, context?: string) => {
    logger.error(`Error in ${context || 'application'}`, error);

    let errorInfo: ErrorInfo;

    if (typeof error === 'string') {
      errorInfo = {
        message: error,
      };
    } else if (error && typeof error === 'object' && 'message' in error) {
      const err = error as { message: string; code?: string; details?: unknown };
      errorInfo = {
        message: err.message,
        code: err.code,
        details: err.details,
      };
    } else {
      errorInfo = {
        message: '发生未知错误，请稍后重试',
      };
    }

    // 显示用户友好的错误消息
    toastError(errorInfo.message);

    // 如果有上下文，可以在这里记录错误
    if (context) {
      // 可以发送到错误监控服务
      logger.group(`Error Context: ${context}`);
      logger.error('Error Details', errorInfo);
      logger.groupEnd();
    }

    return errorInfo;
  }, []);

  const handleSuccess = useCallback((message: string) => {
    toastSuccess(message);
  }, []);

  const handleWarning = useCallback((message: string) => {
    toastWarning(message);
  }, []);

  const handleInfo = useCallback((message: string) => {
    toastInfo(message);
  }, []);

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
  };
}