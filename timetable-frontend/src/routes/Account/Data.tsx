import { ButtonGroup } from "@chakra-ui/react";
import Download from "./Data/Download";
import Delete from "./Data/Delete";

export default function Data() {
  return (
    <ButtonGroup size="sm">
      <Download />
      <Delete />
    </ButtonGroup>
  );
}
