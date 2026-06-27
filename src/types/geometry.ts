export type GeometryType = 'solid_geometry' | 'function_3d' | 'coordinate_geometry';

export interface Point3D {
  id: string;
  x: number;
  y: number;
  z: number;
}

export interface Edge {
  from: string;
  to: string;
}

export interface GeometryData {
  type: GeometryType;
  points?: Point3D[];
  edges?: Edge[];
  faces?: Array<string[]>;
  functionExpression?: string;
  functionId?: string; // 函数名，默认 'f'
  domain?: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  };
  question: string;
  targetAnswer: string;
}

export interface TutorialStep {
  step: number;
  hint: string;
  question: string;
  geogebraHighlight?: string;
  expectedAnswer?: string;
}
