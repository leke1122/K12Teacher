import { GeometryData, Edge } from '@/types/geometry';

/**
 * 生成纯命令字符串，每行一个 GeoGebra 命令。
 * 不再包装 ggbApplet.evalCommand()，直接输出命令本身。
 */
export function generateGeoGebraScript(data: GeometryData): string {
  const commands: string[] = [];

  switch (data.type) {
    case 'solid_geometry':
      commands.push(...generateSolidGeometry(data));
      break;
    case 'function_3d':
      commands.push(...generateFunction3D(data));
      break;
    case 'coordinate_geometry':
      commands.push(...generateCoordinateGeometry(data));
      break;
    default:
      throw new Error(`不支持的几何类型: ${data.type}`);
  }

  const script = commands.join('\n');
  console.log('[ScriptGenerator] 生成的GeoGebra脚本:', script);
  return script;
}

function generateSolidGeometry(data: GeometryData): string[] {
  const cmds: string[] = [];

  data.points?.forEach((point) => {
    cmds.push(`${point.id}=(${point.x},${point.y},${point.z})`);
  });

  data.faces?.forEach((face) => {
    if (face.length >= 3) {
      // Polygon 直接用顶点名不加引号
      const vertices = face.join(',');
      cmds.push(`Polygon(${vertices})`);
    }
  });

  data.edges?.forEach((edge) => {
    if (!isEdgeCoveredByFace(edge, data.faces)) {
      // Segment 的点参数不加引号，直接是变量名
      cmds.push(`Segment(${edge.from},${edge.to})`);
    }
  });

  return cmds;
}

function generateFunction3D(data: GeometryData): string[] {
  const cmds: string[] = [];
  const { functionExpression, domain } = data;

  if (!functionExpression) {
    throw new Error('函数表达式缺失');
  }

  const xMin = domain?.xMin ?? -3;
  const xMax = domain?.xMax ?? 3;
  const yMin = domain?.yMin ?? -3;
  const yMax = domain?.yMax ?? 3;

  cmds.push(`${data.functionId || 'f'}(x,y)=${functionExpression}`);
  cmds.push(`Surface(${data.functionId || 'f'}, ${xMin}, ${xMax}, ${yMin}, ${yMax})`);

  return cmds;
}

function generateCoordinateGeometry(data: GeometryData): string[] {
  const cmds: string[] = [];

  data.points?.forEach((point) => {
    cmds.push(`${point.id}=(${point.x},${point.y},${point.z ?? 0})`);
  });

  if ((data.points?.length ?? 0) >= 2) {
    for (let i = 1; i < data.points!.length; i++) {
      const a = data.points![i - 1].id;
      const b = data.points![i].id;
      cmds.push(`Segment(${a},${b})`);
    }
  }

  return cmds;
}

function isEdgeCoveredByFace(edge: Edge, faces?: Array<string[]>): boolean {
  if (!faces) return false;
  return faces.some((face) => {
    const aIndex = face.indexOf(edge.from);
    const bIndex = face.indexOf(edge.to);
    return aIndex >= 0 && bIndex >= 0 && Math.abs(aIndex - bIndex) <= 1;
  });
}
