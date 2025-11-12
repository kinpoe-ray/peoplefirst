// Recharts库的简化TypeScript类型声明
declare module 'recharts' {
  import { ComponentType } from 'react';
  
  export interface ResponsiveContainerProps {
    width?: string | number;
    height?: string | number;
    children?: React.ReactNode;
  }

  export interface ChartProps {
    data?: any[];
    width?: number | string;
    height?: number | string;
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    title?: string;
    description?: string;
    children?: React.ReactNode;
  }

  export interface AxisProps {
    dataKey?: string;
    domain?: [number, number];
    type?: 'number' | 'category';
    allowDataOverflow?: boolean;
    tick?: boolean | ComponentType<any>;
    tickCount?: number;
  }

  export interface LineProps {
    type?: string;
    dataKey?: string;
    stroke?: string;
    strokeWidth?: number;
    dot?: { r: number } | boolean;
    connectNulls?: boolean;
  }

  export interface BarProps {
    dataKey?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  }

  export interface PieProps {
    cx?: string;
    cy?: string;
    innerRadius?: string;
    outerRadius?: number;
    data?: any[];
    dataKey?: string;
    nameKey?: string;
    fill?: string;
    label?: boolean | ((props: any) => string);
    children?: React.ReactNode;
  }

  export const ResponsiveContainer: ComponentType<ResponsiveContainerProps>;
  export const LineChart: ComponentType<ChartProps>;
  export const Line: ComponentType<LineProps>;
  export const XAxis: ComponentType<AxisProps>;
  export const YAxis: ComponentType<AxisProps>;
  export const CartesianGrid: ComponentType<any>;
  export const Tooltip: ComponentType<any>;
  export const BarChart: ComponentType<ChartProps>;
  export const Bar: ComponentType<BarProps>;
  export const PieChart: ComponentType<ChartProps>;
  export const Pie: ComponentType<PieProps>;
  export const Cell: ComponentType<any>;
}
