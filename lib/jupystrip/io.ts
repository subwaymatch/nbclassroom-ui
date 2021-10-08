import { INotebook } from "typings/jupyter";

export function parseNotebook(notebookJSON: string): INotebook {
  return JSON.parse(notebookJSON) as INotebook;
}
