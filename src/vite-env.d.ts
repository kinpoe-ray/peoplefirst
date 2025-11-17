/// <reference types="vite/client" />

// Fix react-helmet-async JSX element type issue
declare module 'react-helmet-async' {
  import * as React from 'react';

  export interface HelmetProps {
    children?: React.ReactNode;
  }

  export interface ProviderProps {
    context?: object;
    children?: React.ReactNode;
  }

  export const Helmet: React.FC<HelmetProps>;
  export const HelmetProvider: React.FC<ProviderProps>;
}
