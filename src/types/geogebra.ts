/**
 * GeoGebra 交互相关类型定义
 * 用于描述 GeoGebra 3D 图形中的对象、选中事件及截图信息
 */

/** GeoGebra 对象类型枚举 */
export type ObjectType =
  | 'point'
  | 'point3d'
  | 'line'
  | 'line3d'
  | 'segment'
  | 'ray'
  | 'polygon'
  | 'polyhedron'
  | 'surface'
  | 'conic3d'
  | 'function3d'
  | 'plane'
  | 'circle'
  | 'sphere'
  | 'vector'
  | 'angle'
  | 'text'
  | 'image'
  | 'slider'
  | 'function'
  | 'curve'
  | 'inequality'
  | 'list'
  | 'matrix'
  | 'locus'
  | 'sector'
  | 'arc'
  | 'other';

/** GeoGebra 对象坐标 */
export interface ObjectCoordinates {
  x?: number;
  y?: number;
  z?: number;
}

/** GeoGebra 对象属性 */
export interface ObjectProperties {
  label?: string;
  definition?: string;
  command?: string;
  value?: unknown;
  coordinates?: ObjectCoordinates;
  color?: string;
  filling?: number;
  lineThickness?: number;
  pointSize?: number;
  showLabel?: boolean;
}

/** 选中的 GeoGebra 对象 */
export interface SelectedObject {
  id: string;
  type: ObjectType;
  label: string;
  definition?: string;
  properties: ObjectProperties;
  raw: Record<string, unknown>;
}

/** 选中变化事件 */
export interface SelectionEvent {
  objects: SelectedObject[];
  timestamp: number;
  viewState?: {
    centerX?: number;
    centerY?: number;
    centerZ?: number;
    scale?: number;
  };
}

/** 截图结果 */
export interface ScreenshotResult {
  base64: string;
  width: number;
  height: number;
  format: 'png' | 'jpeg';
}

/** 清理函数 */
export type Unsubscribe = () => void;
