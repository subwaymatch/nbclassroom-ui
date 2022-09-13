import { INotebookContent, ICell, isCode } from "lib/jupyterlab/nbformat";
import { doesCellContainPattern } from "./utils";

export function stripNotebook(
  notebook: INotebookContent,
  pattern: string | RegExp,
  clearOutputs = true
) {
  const cells: ICell[] = notebook["cells"];
  const filteredCells: ICell[] = [];

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];

    const shouldRemove = doesCellContainPattern(cell, pattern);

    if (!shouldRemove) {
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
              newLines.push("# YOUR CODE BEGINS");
              startReplace = true;
            } else if (
              trimmedLine === "# YOUR CODE ENDS" ||
              trimmedLine === "### END SOLUTION"
            ) {
              newLines.push("# YOUR CODE ENDS");
              startReplace = false;
            } else {
              newLines.push(startReplace ? "\n" : line);
            }
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
  }

  notebook["cells"] = filteredCells;

  return notebook;
}
