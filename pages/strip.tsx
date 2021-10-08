import SidebarWithHeader from "components/SidebarWithHeader";
import { parseNotebook } from "lib/jupystrip/io";
import { stripNotebook } from "lib/jupystrip/strip";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { saveAs } from "file-saver";

const graderCellKeywordPattern = "# GRADER[S_ ]{0,2}ONLY";

export default function StripPage() {
  const onDrop = useCallback((acceptedFiles: Array<File>) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      console.log(file);

      const fileName = file.name;
      const lastDotLocation = fileName.lastIndexOf(".");
      const fileNameWithoutExtension =
        lastDotLocation >= 0 ? fileName.substr(0, lastDotLocation) : fileName;
      const fileExt =
        lastDotLocation >= 0 ? fileName.substr(lastDotLocation) : "";
      const newFileNameWithoutExtension = fileNameWithoutExtension
        .replace(/\s/g, "")
        .toLowerCase()
        .endsWith("-solution")
        ? fileNameWithoutExtension.replace(/\-solution$/i, "")
        : fileNameWithoutExtension + "-stripped";
      const newFileName = newFileNameWithoutExtension + fileExt;

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        const binaryStr = reader.result;

        const notebook = parseNotebook(binaryStr as string);
        const strippedNotebook = stripNotebook(
          notebook,
          graderCellKeywordPattern,
          true
        );

        const blob = new Blob([JSON.stringify(strippedNotebook)], {
          type: "text/x-python",
        });

        saveAs(blob, newFileName);
      };

      reader.readAsText(file);
    });
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <SidebarWithHeader>
      <h2>Strip Solution Notebook File</h2>

      <div
        {...getRootProps()}
        style={{
          padding: "20px 30px",
          backgroundColor: "#f5f5f5",
          border: "3px solid #eee",
          cursor: "pointer",
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <p>Drag and drop some files here or click to select files</p>
        )}
      </div>
    </SidebarWithHeader>
  );
}
