"use client";

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] 捕获到错误:');
    console.error('错误:', error.message);
    console.error('堆栈:', error.stack);
    console.error('组件堆栈:', errorInfo.componentStack);
    
    this.setState({ errorInfo: errorInfo.componentStack || null });
    this.props.onError?.(error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-lg w-full p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="h-8 w-8" />
              <h1 className="text-2xl font-bold">出错了</h1>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4">
              <p className="text-red-800 dark:text-red-200 font-medium">
                {this.state.error?.message || '发生了未知错误'}
              </p>
            </div>

            {this.state.errorInfo && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">
                  查看详细错误信息
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-x-auto max-h-48">
                  {this.state.error?.stack}
                  {'\n\n组件堆栈:\n'}
                  {this.state.errorInfo}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <Button onClick={this.handleReload} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                重新加载页面
              </Button>
            </div>

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              如果问题持续存在，请检查浏览器控制台获取更多信息。
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
