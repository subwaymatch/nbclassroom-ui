import { INotebookContent, ICell, isCode } from "lib/jupyterlab/nbformat";
import {
  doesCellContainPattern,
  getCellSourceAsString,
  obfuscatePythonCode,
} from "./utils";

const obfuscatePattern = /^\s*_obfuscate\s*=\s*True/gm;
const pointsPattern = /^_points\s*=\s*([\d\.]*).*$/m;
const testCaseNamePattern = /^_test_case\s*=\s*[\'"](.*)[\'"].*$/m;
const hiddenTestPattern = /^### BEGIN HIDDEN TESTS(.*?)### END HIDDEN TESTS/gms;

const hiddenTestTemplate = `\nif 'is_lambdagrader_env' in globals():
# TEST_CASE_REPLACE_HERE\n\n`;

export function convertHiddenTestCases(notebook: INotebookContent) {
  const cells: ICell[] = notebook["cells"];

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    let code = "";

    if (isCode(cell) && doesCellContainPattern(cell, hiddenTestPattern)) {
      let source = getCellSourceAsString(cell);

      // hidden tests
      const hiddenTestMatches = source.match(hiddenTestPattern);

      if (hiddenTestMatches) {
        hiddenTestMatches.forEach((match) => {
          code = "";
          // create a copy of the match
          let matchText = `${match}`;

          // matchText = matchText.replace(/^### BEGIN HIDDEN TESTS/, "");
          // matchText = matchText.replace(/### END HIDDEN TESTS$/, "");
          matchText = matchText.trim();
          matchText = matchText.replace(/^/gm, "    ");

          // use .split().join() to avoid the match string to be used as a regular expression
          code += hiddenTestTemplate
            .split("# TEST_CASE_REPLACE_HERE")
            .join(matchText);

          // if the code cell is not configured to obfuscate
          // obfuscate the hidden test case
          if (!doesCellContainPattern(cell, obfuscatePattern)) {
            code = obfuscatePythonCode(code);
          }

          code = "# HIDDEN TESTS THAT ONLY RUN DURING GRADING\n" + code;

          source = source.replace(match, function () {
            return code;
          });
        });

        cell.source = source;
      }
    }
  }

  return notebook;
}

export function obfuscateNotebook(notebook: INotebookContent) {
  const cells: ICell[] = notebook["cells"];

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];

    if (isCode(cell) && doesCellContainPattern(cell, obfuscatePattern)) {
      let code = getCellSourceAsString(cell);

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

      // obfuscate
      code = code.trim();
      obfuscatedCode += obfuscatePythonCode(code);
      cell.source = obfuscatedCode;
    }
  }

  return notebook;
}
