import { INotebookContent } from "lib/jupyterlab/nbformat";

export function parseNotebook(notebookJSON: string): INotebookContent {
  return JSON.parse(notebookJSON) as INotebookContent;
}
