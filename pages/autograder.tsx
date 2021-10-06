import SidebarWithHeader from "components/SidebarWithHeader";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function AutoGraderPage() {
  const onDrop = useCallback((acceptedFiles) => {
    console.log(`useCallback onDrop`);
    console.log(acceptedFiles);

    acceptedFiles.forEach((file: any) => {
      const reader = new FileReader();

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        const binaryStr = reader.result;
        console.log(`binaryStr result`);
        console.log(binaryStr);

        const parsed = JSON.parse(binaryStr as string);
        console.log(parsed);
      };
      reader.readAsText(file);
    });
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <SidebarWithHeader>
      <h2>Autograder</h2>

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
