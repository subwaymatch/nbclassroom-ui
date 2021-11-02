import beforeScript from "python/autograder/before.py";
import afterScript from "python/autograder/after.py";
import { getNewCodeCell } from "./utils";

export function getBeforeScriptCodeCell() {
  return getNewCodeCell(beforeScript);
}

export function getAfterScriptCodeCell() {
  return getNewCodeCell(afterScript);
}
