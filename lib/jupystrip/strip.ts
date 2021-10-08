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
            if (line.trim() === "# YOUR CODE BEGINS") {
              newLines.push(line);
              startReplace = true;
            } else if (line.trim() === "# YOUR CODE ENDS") {
              newLines.push(line);
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
