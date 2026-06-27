export function validateScript(script: string): { valid: boolean; error?: string } {
  const allowedPrefixes = [
    'ggbApplet.evalCommand',
    'ggbApplet.setValue',
    'ggbApplet.setColor',
    'ggbApplet.setLabelMode'
  ];

  const lines = script.split('\n').filter((line) => line.trim() !== '');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('//')) continue;

    const isValid = allowedPrefixes.some((prefix) => trimmed.startsWith(prefix));
    if (!isValid) {
      return { valid: false, error: `不允许的命令: ${trimmed.substring(0, 50)}...` };
    }
  }

  return { valid: true };
}
