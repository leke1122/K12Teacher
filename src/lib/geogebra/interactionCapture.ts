/**
 * GeoGebra 交互捕获模块
 * 提供与 GeoGebra iframe 通信的能力：获取选中对象、截图、监听选中变化
 */

import type {
  ObjectType,
  SelectedObject,
  ObjectProperties,
  ObjectCoordinates,
  SelectionEvent,
  ScreenshotResult,
  Unsubscribe,
} from '@/types/geogebra';

// ---------------------------------------------------------------------------
// 类型映射
// ---------------------------------------------------------------------------

/**
 * 将 GeoGebra 内部类型码映射为友好类型名
 */
export function mapGeoGebraType(code: number | string): ObjectType {
  const typeMap: Record<number, ObjectType> = {
    0: 'other',
    1: 'point',
    2: 'point',
    3: 'point',
    4: 'line',
    5: 'line',
    6: 'ray',
    7: 'segment',
    8: 'polygon',
    9: 'polygon',
    10: 'polygon',
    11: 'polygon',
    12: 'polygon',
    13: 'circle',
    14: 'circle',
    15: 'conic3d',
    16: 'conic3d',
    17: 'function',
    18: 'function',
    19: 'function',
    20: 'curve',
    21: 'curve',
    22: 'inequality',
    23: 'inequality',
    24: 'angle',
    25: 'angle',
    26: 'angle',
    27: 'angle',
    28: 'text',
    29: 'image',
    30: 'image',
    31: 'slider',
    32: 'angle',
    33: 'polygon',
    34: 'polyhedron',
    35: 'surface',
    36: 'conic3d',
    37: 'function3d',
    38: 'line3d',
    39: 'plane',
    40: 'point3d',
    41: 'sphere',
    42: 'vector',
    43: 'other',
    45: 'other',
    46: 'other',
    47: 'list',
    48: 'matrix',
    49: 'function',
    50: 'locus',
    51: 'sector',
    52: 'arc',
    53: 'polygon',
    54: 'angle',
    55: 'conic3d',
    56: 'text',
    57: 'other',
    58: 'other',
    59: 'other',
  };

  if (typeof code === 'string') {
    const normalized = code.toLowerCase();
    const allowed: ObjectType[] = [
      'point', 'point3d', 'line', 'line3d', 'segment', 'ray', 'polygon',
      'polyhedron', 'surface', 'conic3d', 'function3d', 'plane', 'circle',
      'sphere', 'vector', 'angle', 'text', 'image', 'slider', 'function',
      'curve', 'inequality', 'list', 'matrix', 'locus', 'sector', 'arc',
      'other',
    ];
    return allowed.includes(normalized as ObjectType) ? (normalized as ObjectType) : 'other';
  }

  return typeMap[code] ?? 'other';
}

/**
 * 判断对象是否为 3D 对象
 */
export function is3DObject(type: ObjectType): boolean {
  return [
    'point3d',
    'line3d',
    'polyhedron',
    'surface',
    'conic3d',
    'function3d',
    'plane',
    'sphere',
  ].includes(type);
}

/**
 * 获取对象的中文显示名称
 */
export function getDisplayName(type: ObjectType): string {
  const names: Record<ObjectType, string> = {
    point: '点',
    point3d: '3D 点',
    line: '直线',
    line3d: '3D 直线',
    segment: '线段',
    ray: '射线',
    polygon: '多边形',
    polyhedron: '多面体',
    surface: '曲面',
    conic3d: '3D 圆锥曲线',
    function3d: '3D 函数',
    plane: '平面',
    circle: '圆',
    sphere: '球',
    vector: '向量',
    angle: '角',
    text: '文本',
    image: '图片',
    slider: '滑动条',
    function: '函数',
    curve: '曲线',
    inequality: '不等式',
    list: '列表',
    matrix: '矩阵',
    locus: '轨迹',
    sector: '扇形',
    arc: '圆弧',
    other: '其他',
  };

  return names[type] ?? '未知对象';
}

// ---------------------------------------------------------------------------
// 内部工具
// ---------------------------------------------------------------------------

/**
 * 将原始对象数据解析为 SelectedObject
 */
export function parseSelectedObjects(rawObjects: unknown[]): SelectedObject[] {
  if (!Array.isArray(rawObjects)) {
    return [];
  }

  return rawObjects
    .map((raw) => parseSelectedObject(raw))
    .filter((obj): obj is SelectedObject => obj !== null);
}

/**
 * 解析单个原始对象
 */
function parseSelectedObject(raw: unknown): SelectedObject | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const id = typeof record.id === 'string' ? record.id : String(record.id ?? '');
  const label = typeof record.label === 'string' ? record.label : id;
  const rawType = typeof record.type === 'string' ? record.type : (typeof record.type === 'number' ? String(record.type) : 'other');
  const type = mapGeoGebraType(rawType);
  const definition = typeof record.definition === 'string' ? record.definition : undefined;
  const rawProperties = typeof record.properties === 'object' && record.properties !== null
    ? (record.properties as Record<string, unknown>)
    : {};

  const properties = buildProperties(type, rawProperties, record);

  return {
    id,
    type,
    label,
    definition,
    properties,
    raw: record as Record<string, unknown>,
  };
}

/**
 * 构建标准化属性对象
 */
function buildProperties(
  type: ObjectType,
  rawProperties: Record<string, unknown>,
  rawRecord: Record<string, unknown>,
): ObjectProperties {
  const props: ObjectProperties = {};

  if (typeof rawProperties.label === 'string') props.label = rawProperties.label;
  if (typeof rawProperties.definition === 'string') props.definition = rawProperties.definition;
  if (typeof rawProperties.command === 'string') props.command = rawProperties.command;
  if (typeof rawProperties.value !== 'undefined') props.value = rawProperties.value;
  if (typeof rawProperties.color === 'string') props.color = rawProperties.color;
  if (typeof rawProperties.filling === 'number') props.filling = rawProperties.filling;
  if (typeof rawProperties.lineThickness === 'number') props.lineThickness = rawProperties.lineThickness;
  if (typeof rawProperties.pointSize === 'number') props.pointSize = rawProperties.pointSize;
  if (typeof rawProperties.showLabel === 'boolean') props.showLabel = rawProperties.showLabel;

  // 处理坐标
  const coords = extractCoordinates(type, rawProperties, rawRecord);
  if (coords) {
    props.coordinates = coords;
  }

  return props;
}

/**
 * 从原始数据中提取坐标
 */
function extractCoordinates(
  type: ObjectType,
  rawProperties: Record<string, unknown>,
  rawRecord: Record<string, unknown>,
): ObjectCoordinates | undefined {
  // 优先从 properties.coordinates 读取
  const propCoords = rawProperties.coordinates;
  if (propCoords && typeof propCoords === 'object') {
    const c = propCoords as Record<string, unknown>;
    const result: ObjectCoordinates = {};
    if (typeof c.x === 'number') result.x = c.x;
    if (typeof c.y === 'number') result.y = c.y;
    if (typeof c.z === 'number') result.z = c.z;
    if (Object.keys(result).length > 0) return result;
  }

  // 尝试从 rawRecord 中读取坐标字段
  if (typeof rawRecord.coordinates === 'object' && rawRecord.coordinates !== null) {
    const c = rawRecord.coordinates as Record<string, unknown>;
    const result: ObjectCoordinates = {};
    if (typeof c.x === 'number') result.x = c.x;
    if (typeof c.y === 'number') result.y = c.y;
    if (typeof c.z === 'number') result.z = c.z;
    if (Object.keys(result).length > 0) return result;
  }

  // 点类对象尝试从 value 读取
  if (type === 'point' || type === 'point3d') {
    const value = rawRecord.value ?? rawProperties.value;
    if (Array.isArray(value) && value.length >= 2) {
      const result: ObjectCoordinates = { x: Number(value[0]), y: Number(value[1]) };
      if (value.length >= 3) result.z = Number(value[2]);
      return result;
    }
  }

  return undefined;
}

// ---------------------------------------------------------------------------
// iframe 通信
// ---------------------------------------------------------------------------

/**
 * 获取 iframe 的 contentWindow
 */
function getIframeWindow(iframe: HTMLIFrameElement): Window | null {
  try {
    return iframe.contentWindow;
  } catch {
    return null;
  }
}

/**
 * 获取 GeoGebra applet 实例（通过 iframe 的 contentWindow）
 * 注意：GeoGebra 将 applet 挂载在 iframe.contentWindow.ggbApplet 上
 */
export function getGeoGebraApplet(iframe: HTMLIFrameElement): unknown {
  const win = getIframeWindow(iframe);
  if (!win) return null;

  try {
    return (win as unknown as Record<string, unknown>).ggbApplet ?? null;
  } catch {
    return null;
  }
}

/**
 * 捕获 iframe 中当前选中的对象列表
 */
export function captureSelectedObjects(iframe: HTMLIFrameElement): SelectedObject[] {
  const win = getIframeWindow(iframe);
  if (!win) return [];

  try {
    const getSelected = (win as unknown as Record<string, unknown>).getSelectedObjects;
    if (typeof getSelected !== 'function') return [];

    const raw = getSelected();
    if (!Array.isArray(raw)) return [];

    return parseSelectedObjects(raw);
  } catch {
    return [];
  }
}

/**
 * 捕获 iframe 当前视图的截图（返回 base64）
 */
export function captureScreenshot(iframe: HTMLIFrameElement): ScreenshotResult | null {
  const win = getIframeWindow(iframe);
  if (!win) return null;

  try {
    const capture = (win as unknown as Record<string, unknown>).captureScreenshot;
    if (typeof capture !== 'function') return null;

    const result = capture() as
      | { base64: string; width: number; height: number; format: string }
      | null
      | undefined;

    if (!result || typeof result.base64 !== 'string') return null;

    return {
      base64: result.base64,
      width: typeof result.width === 'number' ? result.width : 1280,
      height: typeof result.height === 'number' ? result.height : 720,
      format: result.format === 'jpeg' ? 'jpeg' : 'png',
    };
  } catch {
    return null;
  }
}

/**
 * 监听 iframe 中 GeoGebra 的选中变化事件
 * 返回取消监听函数
 */
export function onSelectionChange(
  iframe: HTMLIFrameElement,
  callback: (event: SelectionEvent) => void,
): Unsubscribe {
  const handler = (event: MessageEvent) => {
    if (!iframe.contentWindow || event.source !== iframe.contentWindow) {
      return;
    }

    const data = event.data;
    if (!data || typeof data !== 'object') return;
    if (data.type !== 'geogebra_selection_change') return;

    const rawObjects = Array.isArray(data.selectedObjects) ? data.selectedObjects : [];
    const objects = parseSelectedObjects(rawObjects);

    const selectionEvent: SelectionEvent = {
      objects,
      timestamp: typeof data.timestamp === 'number' ? data.timestamp : Date.now(),
    };

    callback(selectionEvent);
  };

  window.addEventListener('message', handler);

  return () => {
    window.removeEventListener('message', handler);
  };
}
