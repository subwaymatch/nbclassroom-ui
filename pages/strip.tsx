import SidebarWithHeader from "components/SidebarWithHeader";
import { parseNotebook } from "lib/jupystrip/io";
import { stripNotebook } from "lib/jupystrip/strip";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { saveAs } from "file-saver";
import { Box, Center, Heading, Text } from "@chakra-ui/layout";
import { obfuscateNotebook } from "lib/jupystrip/obfuscate";

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
        stripNotebook(notebook, graderCellKeywordPattern, true);
        obfuscateNotebook(notebook);

        const blob = new Blob([JSON.stringify(notebook)], {
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
      <Heading as="h1" fontWeight={600} mt={4}>
        Strip Solution Notebook File
      </Heading>

      <Box
        p={16}
        mt={8}
        bg="gray.50"
        borderWidth={8}
        borderColor="gray.200"
        {...getRootProps()}
        style={{
          cursor: "pointer",
        }}
      >
        <input {...getInputProps()} />
        <Center>
          <Text>
            {isDragActive
              ? "Drop the files here..."
              : "Drag and drop some files here or click to select files"}
          </Text>
        </Center>
      </Box>
    </SidebarWithHeader>
  );
}
