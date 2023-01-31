import { INotebookContent, ICell, isCode } from "lib/jupyterlab/nbformat";
import { doesCellContainPattern } from "./utils";

const obfuscatePattern = /^\s*_obfuscate\s*=\s*True/gm;
const pointsPattern = /^_points\s*=\s*([\d\.]*).*$/m;
const testCaseNamePattern = /^_test_case\s*=\s*[\'"](.*)[\'"].*$/m;
const hiddenTestPattern = /^### BEGIN HIDDEN TESTS(.*?)### END HIDDEN TESTS/gms;

const hiddenTestTemplate = `\nif 'is_lambdagrader_env' in globals():
# TEST_CASE_REPLACE_HERE\n\n`;

export function obfuscateNotebook(notebook: INotebookContent) {
  const cells: ICell[] = notebook["cells"];

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];

    if (isCode(cell) && doesCellContainPattern(cell, obfuscatePattern)) {
      let code = Array.isArray(cell.source)
        ? cell.source.join("")
        : cell.source;

      let obfuscatedCode = "# DO NOT CHANGE THE CODE IN THIS CELL\n";

      // extract test case name
      const testCaseNameMatch = testCaseNamePattern.exec(code);
      if (testCaseNameMatch) {
        obfuscatedCode += `${testCaseNameMatch[0]}\n`;

        code = code.replace(testCaseNamePattern, "");
      }

      // extract points
      const pointsMatch = pointsPattern.exec(code);
      if (pointsMatch) {
        obfuscatedCode += `${pointsMatch[0]}\n`;

        code = code.replace(pointsPattern, "");
      }

      // extract obfuscation flag
      obfuscatedCode += "_obfuscate = True\n\n";
      code = code.replace(obfuscatePattern, "");
      code = code.trim();

      // hidden tests
      const hiddenTestMatches = code.match(hiddenTestPattern);

      console.log("Hidden test matches");
      console.log(hiddenTestMatches);
      console.log("====");

      if (hiddenTestMatches) {
        hiddenTestMatches.forEach((match) => {
          match = match.replace(/^### BEGIN HIDDEN TESTS/, "");
          match = match.replace(/### END HIDDEN TESTS$/, "");
          match = match.trim();
          match = match.replace(/^/gm, "    ");

          code += hiddenTestTemplate.replace("# TEST_CASE_REPLACE_HERE", match);
        });

        code = code.replace(hiddenTestPattern, "");
      }

      console.log(code);

      let encodedCode = window.btoa(code);
      obfuscatedCode += "import base64 as _b64\n";

      let b64part = `_64 = _b64.b64decode('${encodedCode}')\n`;
      b64part = b64part.replace(/(.{100})/g, "$1\\\n");

      b64part = /\\[\r?\n]+$/.test(b64part)
        ? b64part.slice(0, -3) + "\n"
        : b64part;

      obfuscatedCode += b64part;

      obfuscatedCode += `eval(compile(_64, '<string>', 'exec'))`;
      obfuscatedCode.split(/\r?\n/).map((s) => s + "\n");

      //   console.log(obfuscatedCode);

      cell.source = obfuscatedCode.split(/\r?\n/).map((s) => s + "\n");
      cell.source[cell.source.length - 1] =
        cell.source[cell.source.length - 1].trimEnd();

      cells[i] = cell;
    }
  }

  return notebook;
}
