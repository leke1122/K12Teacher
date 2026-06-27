export const GEOMETRY_EXTRACTION_PROMPT = `
你是一位数学解题专家。请分析这张包含立体几何或函数题目的图片，提取以下信息并以JSON格式返回：

1. **题目类型**：'solid_geometry' | 'function_3d' | 'coordinate_geometry'
2. **关键元素**：
   - 立体几何：顶点坐标（用A、B、C等标识）、棱的连接关系、面
   - 函数：函数表达式、定义域范围
3. **图形参数**：所有可用于构建3D模型的具体数值
4. **题目的核心问题**：用户需要求解什么？
5. **目标答案**：本题的标准答案

请只返回JSON，不要额外解释。JSON格式示例：
{
  "type": "solid_geometry",
  "points": [{"id": "A", "x": 0, "y": 0, "z": 0}, ...],
  "edges": [{"from": "A", "to": "B"}, ...],
  "faces": [["A","B","C","D"], ...],
  "question": "求正方体ABCD-A'B'C'D'的对角线长度",
  "targetAnswer": "2√3"
}
`;
