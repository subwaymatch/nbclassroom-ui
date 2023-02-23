import { ICell } from "lib/jupyterlab/nbformat";

export function doesCellContainPattern(cell: ICell, pattern: string | RegExp) {
  if (!(pattern instanceof RegExp)) {
    pattern = new RegExp(pattern);
  }

  const code = getCellSourceAsString(cell);

  return !!code.match(pattern);
}

export function getCellSourceAsString(cell: ICell) {
  // Notebook cells can either be a string or an array of strings
  // If array, convert it to a string
  return Array.isArray(cell.source) ? cell.source.join("") : cell.source;
}

export function obfuscatePythonCode(code: string): string {
  let encodedCode = window.btoa(unescape(encodeURIComponent(code)));
  let obfuscatedCode = "";
  obfuscatedCode += "import base64 as _b64\n";

  let b64part = `_64 = _b64.b64decode('${encodedCode}')\n`;
  b64part = b64part.replace(/(.{100})/g, "$1\\\n");

  b64part = /\\[\r?\n]+$/.test(b64part) ? b64part.slice(0, -3) + "\n" : b64part;
  obfuscatedCode += b64part;
  obfuscatedCode += `eval(compile(_64, '<string>', 'exec'))`;
  obfuscatedCode = obfuscatedCode
    .split(/\r?\n/)
    .map((s) => s + "\n")
    .join("")
    .trimEnd();

  return obfuscatedCode;
}
