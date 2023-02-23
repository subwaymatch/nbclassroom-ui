import SidebarWithHeader from "components/SidebarWithHeader";
import { parseNotebook } from "lib/jupystrip/io";
import {
  stripSolutionCodesFromNotebook,
  stripCellsByPatternFromNotebook,
} from "lib/jupystrip/strip";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { saveAs } from "file-saver";
import { Box, Center, Heading, Text } from "@chakra-ui/layout";
import {
  convertHiddenTestCases,
  obfuscateNotebook,
} from "lib/jupystrip/obfuscate";
import { ICell } from "lib/jupyterlab/nbformat";

const graderCellKeywordPattern = "# GRADER[S_ ]{0,2}ONLY";

export default function StripPage() {
  const [cells, setCells] = useState<ICell[]>([]);

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

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        const binaryStr = reader.result;

        const notebook = parseNotebook(binaryStr as string);

        // obfuscation (before stripping)

        convertHiddenTestCases(notebook);
        obfuscateNotebook(notebook);

        const blobBeforeStrip = new Blob([JSON.stringify(notebook)], {
          type: "text/x-python",
        });
        let saveFileNameWithoutExtension = fileNameWithoutExtension
          .replace(/\s/g, "")
          .toLowerCase()
          .endsWith("-solution")
          ? fileNameWithoutExtension.replace(/\-solution$/i, "-test")
          : fileNameWithoutExtension + "-test";
        let saveFileName = saveFileNameWithoutExtension + fileExt;
        saveAs(blobBeforeStrip, saveFileName);

        // after stripping solution code
        stripCellsByPatternFromNotebook(notebook, graderCellKeywordPattern);
        stripSolutionCodesFromNotebook(notebook, true);

        setCells(notebook.cells);

        const blobAfterStrip = new Blob([JSON.stringify(notebook)], {
          type: "text/x-python",
        });
        saveFileNameWithoutExtension = fileNameWithoutExtension
          .replace(/\s/g, "")
          .toLowerCase()
          .endsWith("-solution")
          ? fileNameWithoutExtension.replace(/\-solution$/i, "")
          : fileNameWithoutExtension + "-stripped";
        saveFileName = saveFileNameWithoutExtension + fileExt;
        saveAs(blobAfterStrip, saveFileName);
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

      <Box mt={4}>
        <Box
          p={16}
          bg="gray.50"
          borderWidth={8}
          borderColor="gray.200"
          style={{
            cursor: "pointer",
          }}
          {...getRootProps()}
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

        <Box mt={6}>
          {cells.map((c, i) => (
            <Box
              key={i}
              borderColor="gray.400"
              borderTopWidth={1}
              py={4}
              fontSize="sm"
            >
              <pre>{c.source}</pre>
            </Box>
          ))}
        </Box>
      </Box>
    </SidebarWithHeader>
  );
}
