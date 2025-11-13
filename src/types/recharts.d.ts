// Recharts库的简化TypeScript类型声明
declare module 'recharts' {
  import { ComponentType, SVGProps } from 'react';

  export interface ResponsiveContainerProps {
    width?: string | number;
    height?: string | number;
    children?: React.ReactNode;
  }

  export interface ChartData {
    [key: string]: string | number | undefined;
  }

  export interface ChartProps {
    data?: ChartData[];
    width?: number | string;
    height?: number | string;
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    title?: string;
    description?: string;
    children?: React.ReactNode;
  }

  export interface TickProps extends SVGProps<SVGTextElement> {
    x?: number;
    y?: number;
    payload?: { value: string | number };
  }

  export interface AxisProps {
    dataKey?: string;
    domain?: [number, number] | ['auto' | 'dataMin' | 'dataMax', 'auto' | 'dataMin' | 'dataMax'];
    type?: 'number' | 'category';
    allowDataOverflow?: boolean;
    tick?: boolean | ComponentType<TickProps>;
    tickCount?: number;
  }

  export interface LineProps {
    type?: 'basis' | 'basisClosed' | 'basisOpen' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
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

  export interface PieLabelRenderProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    index: number;
    name?: string;
    value?: number;
  }

  export interface PieProps {
    cx?: string | number;
    cy?: string | number;
    innerRadius?: string | number;
    outerRadius?: string | number;
    data?: ChartData[];
    dataKey?: string;
    nameKey?: string;
    fill?: string;
    label?: boolean | ((props: PieLabelRenderProps) => string | React.ReactElement);
    children?: React.ReactNode;
  }

  export interface CartesianGridProps {
    strokeDasharray?: string;
    stroke?: string;
    horizontal?: boolean;
    vertical?: boolean;
  }

  export interface TooltipProps<TValue = number, TName = string> {
    active?: boolean;
    payload?: Array<{
      value: TValue;
      name: TName;
      dataKey?: string;
      color?: string;
    }>;
    label?: string | number;
    separator?: string;
    formatter?: (value: TValue, name: TName) => [string | number, string];
    labelFormatter?: (label: string | number) => React.ReactNode;
  }

  export interface CellProps {
    fill?: string;
    key?: string | number;
  }

  export const ResponsiveContainer: ComponentType<ResponsiveContainerProps>;
  export const LineChart: ComponentType<ChartProps>;
  export const Line: ComponentType<LineProps>;
  export const XAxis: ComponentType<AxisProps>;
  export const YAxis: ComponentType<AxisProps>;
  export const CartesianGrid: ComponentType<CartesianGridProps>;
  export const Tooltip: ComponentType<TooltipProps>;
  export const BarChart: ComponentType<ChartProps>;
  export const Bar: ComponentType<BarProps>;
  export const PieChart: ComponentType<ChartProps>;
  export const Pie: ComponentType<PieProps>;
  export const Cell: ComponentType<CellProps>;
}
