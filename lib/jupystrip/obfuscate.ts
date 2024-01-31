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
const hiddenTestMessage =
  "# THIS CELL INCLUDES HIDDEN TESTS THAT ONLY RUN DURING THE GRADING PROCESS\n";

const hiddenTestTemplate = `\nif 'is_lambdagrader_env' in globals():
# TEST_CASE_REPLACE_HERE\n\n`;

export function convertHiddenTestCases(notebook: INotebookContent) {
  // process cells that contains hidden test case patterns
  // but is not configured
  notebook["cells"]
    .filter(
      (cell) => isCode(cell) && doesCellContainPattern(cell, hiddenTestPattern)
    )
    .forEach((cell) => {
      let source = getCellSourceAsString(cell);

      // hidden tests
      const hiddenTestMatches = source.match(hiddenTestPattern);

      if (hiddenTestMatches) {
        hiddenTestMatches.forEach((match) => {
          let code = "";
          // create a copy of the match
          let matchText = `${match}`;

          matchText = matchText.trim();
          matchText = matchText.replace(/^/gm, "    ");

          // use .split().join() to avoid the match string to be used as a regular expression
          code += hiddenTestTemplate
            .split("# TEST_CASE_REPLACE_HERE")
            .join(matchText);

          // if the code cell is not configured to obfuscate
          // obfuscate the hidden test case
          // if the code cell is configured to obfuscate
          // there is no need to obfuscate the code here as the entire cell will be obfuscated
          if (!doesCellContainPattern(cell, obfuscatePattern)) {
            code = obfuscatePythonCode(code);
          }

          source = source.replace(match, function () {
            return code;
          });
        });

        cell.source = hiddenTestMessage + source;
      }
    });

  return notebook;
}

export function obfuscateNotebook(notebook: INotebookContent) {
  notebook["cells"]
    .filter(
      (cell) => isCode(cell) && doesCellContainPattern(cell, obfuscatePattern)
    )
    .forEach((cell) => {
      let code = getCellSourceAsString(cell);

      let newCode = "";

      // extract test case name
      const testCaseNameMatch = testCaseNamePattern.exec(code);
      if (testCaseNameMatch) {
        newCode += `${testCaseNameMatch[0]}\n`;

        code = code.replace(testCaseNamePattern, "");
      }

      // extract points
      const pointsMatch = pointsPattern.exec(code);
      if (pointsMatch) {
        newCode += `${pointsMatch[0]}\n`;

        code = code.replace(pointsPattern, "");
      }

      // extract obfuscation flag
      newCode += "_obfuscate = True\n\n";
      code = code.replace(obfuscatePattern, "");

      // trim whitespaces
      code = code.trim();

      // if the cell includes hidden test cases,
      // add a message as a comment
      if (doesCellContainPattern(cell, hiddenTestPattern)) {
        newCode = hiddenTestMessage + newCode;
      }

      // obfuscate remaining code
      newCode += obfuscatePythonCode(code);
      cell.source = newCode;
    });

  return notebook;
}

export function addDoNotChangeTestCaseCellWarnings(notebook: INotebookContent) {
  notebook["cells"]
    .filter(
      (cell) =>
        isCode(cell) && doesCellContainPattern(cell, testCaseNamePattern)
    )
    .forEach((cell) => {
      let code = getCellSourceAsString(cell);

      // remove do not change warning if it exists
      code = code.replace("# DO NOT CHANGE THE CODE IN THIS CELL", "").trim();

      // add the warning message at the top of the cell
      code = "# DO NOT CHANGE THE CODE IN THIS CELL\n" + code;

      cell.source = code;
    });

  return notebook;
}
