import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { toast } from 'sonner';
import { createLogger } from '../lib/logger';

const logger = createLogger('ErrorBoundary');

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error', { error, errorInfo });
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRefresh = () => {
    window.location.href = window.location.pathname;
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    const errorReport = {
      error: error?.toString(),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    logger.info('Error report generated', errorReport);
    toast.success('错误已记录。我们会尽快处理此问题。', {
      duration: 4000,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center px-6 py-12">
          <div className="max-w-2xl w-full bg-dark-surface border border-dark-border rounded-2xl p-8 shadow-xl">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-warningRed/10 border-2 border-warningRed/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-warningRed" />
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-3">
                哎呀，出错了
              </h1>
              <p className="text-dark-text-secondary text-lg">
                我们遇到了一个意外的问题
              </p>
            </div>

            {/* Error Details (collapsed by default) */}
            {this.state.error && (
              <details className="mb-6 bg-dark-bg border border-dark-border rounded-lg overflow-hidden">
                <summary className="px-4 py-3 cursor-pointer hover:bg-white/5 text-dark-text-secondary text-sm font-medium">
                  查看错误详情
                </summary>
                <div className="px-4 py-3 border-t border-dark-border">
                  <pre className="text-xs text-warningRed overflow-x-auto whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                    {this.state.error.stack && (
                      <div className="mt-2 text-dark-text-tertiary">
                        {this.state.error.stack}
                      </div>
                    )}
                  </pre>
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRefresh}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-pathBlue hover:bg-pathBlue-dark text-white rounded-lg font-medium transition-all shadow-lg shadow-pathBlue/20"
              >
                <RefreshCw className="w-5 h-5" />
                刷新页面
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-dark-bg hover:bg-white/5 border border-dark-border text-dark-text-secondary hover:text-white rounded-lg font-medium transition-all"
              >
                <Home className="w-5 h-5" />
                返回首页
              </button>

              <button
                onClick={this.handleReportError}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-dark-bg hover:bg-white/5 border border-dark-border text-dark-text-secondary hover:text-white rounded-lg font-medium transition-all"
              >
                <AlertTriangle className="w-5 h-5" />
                报告问题
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-dark-border text-center">
              <p className="text-sm text-dark-text-tertiary">
                如果问题持续存在，请尝试清除浏览器缓存或联系技术支持
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
