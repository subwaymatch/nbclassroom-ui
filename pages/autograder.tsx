import SidebarWithHeader from "components/SidebarWithHeader";
import { parseNotebook } from "lib/jupystrip/io";
import { stripNotebook } from "lib/jupystrip/strip";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { saveAs } from "file-saver";
import { NotebookModel } from "@jupyterlab/notebook";

const graderCellKeywordPattern = "# GRADER[S_ ]{0,2}ONLY";

export default function StripPage() {
  const onDrop = useCallback((acceptedFiles: Array<File>) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      console.log(file);

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        const notebookString = reader.result as string;

        const model = new NotebookModel();
        model.fromString(notebookString);

        console.log(model);

        // const notebook = parseNotebook(binaryStr as string);
        // const strippedNotebook = stripNotebook(
        //   notebook,
        //   graderCellKeywordPattern,
        //   true
        // );

        // const blob = new Blob([JSON.stringify(strippedNotebook)], {
        //   type: "text/x-python",
        // });

        // saveAs(blob, 'test.ipynb');
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
