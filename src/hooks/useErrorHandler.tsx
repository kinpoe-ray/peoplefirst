import { useCallback } from 'react';
import { useToast } from '../components/Toast';

interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
  action?: () => void;
}

export function useErrorHandler() {
  const { addToast } = useToast();

  const handleError = useCallback((error: any, context?: string) => {
    console.error(`Error in ${context || 'application'}:`, error);
    
    let errorInfo: ErrorInfo;
    
    if (typeof error === 'string') {
      errorInfo = {
        message: error,
      };
    } else if (error?.message) {
      errorInfo = {
        message: error.message,
        code: error.code,
        details: error.details,
      };
    } else {
      errorInfo = {
        message: '发生未知错误，请稍后重试',
      };
    }

    // 显示用户友好的错误消息
    addToast({
      type: 'error',
      title: '操作失败',
      message: errorInfo.message,
      duration: 6000,
    });

    // 如果有上下文，可以在这里记录错误
    if (context) {
      // 可以发送到错误监控服务
      console.group(`Error Context: ${context}`);
      console.error('Error Details:', errorInfo);
      console.groupEnd();
    }

    return errorInfo;
  }, [addToast]);

  const handleSuccess = useCallback((message: string, title: string = '操作成功') => {
    addToast({
      type: 'success',
      title,
      message,
      duration: 3000,
    });
  }, [addToast]);

  const handleWarning = useCallback((message: string, title: string = '提醒') => {
    addToast({
      type: 'warning',
      title,
      message,
      duration: 4000,
    });
  }, [addToast]);

  const handleInfo = useCallback((message: string, title: string = '信息') => {
    addToast({
      type: 'info',
      title,
      message,
      duration: 3000,
    });
  }, [addToast]);

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
  };
}