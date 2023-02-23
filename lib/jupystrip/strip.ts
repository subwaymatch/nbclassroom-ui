import { INotebookContent, ICell, isCode } from "lib/jupyterlab/nbformat";
import { doesCellContainPattern } from "./utils";

export function stripSolutionCodesFromNotebook(
  notebook: INotebookContent,
  clearOutputs = true
) {
  const cells: ICell[] = notebook["cells"];
  const filteredCells: ICell[] = [];

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];

    if (isCode(cell)) {
      if (Array.isArray(cell.source)) {
        let startReplace = false;
        let newLines = [];

        for (const line of cell.source) {
          const trimmedLine = line.trim();

          if (
            trimmedLine === "# YOUR CODE BEGINS" ||
            trimmedLine === "### BEGIN SOLUTION"
          ) {
            newLines.push("# YOUR CODE BEGINS\n\n");
            startReplace = true;
          } else if (
            trimmedLine === "# YOUR CODE ENDS" ||
            trimmedLine === "### END SOLUTION"
          ) {
            newLines.push("# YOUR CODE ENDS\n");
            startReplace = false;
          } else if (!startReplace) {
            newLines.push(line);
          }
        }

        if (newLines.length > 0) {
          newLines[newLines.length - 1] =
            newLines[newLines.length - 1].trimEnd();
        }

        cell.source = newLines;
      }

      if (clearOutputs) {
        cell["execution_count"] = null;
        cell["outputs"] = [];
      }
    }

    filteredCells.push(cell);
  }

  notebook["cells"] = filteredCells;
}

export function stripCellsByPatternFromNotebook(
  notebook: INotebookContent,
  removeCellPattern: string | RegExp
) {
  notebook["cells"] = notebook["cells"].filter(
    (cell) => !doesCellContainPattern(cell, removeCellPattern)
  );
}
