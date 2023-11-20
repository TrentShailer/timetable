import { Button, useDisclosure } from "@chakra-ui/react";
import DeleteModal from "./DeleteModal/DeleteModal";

export default function Delete() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <DeleteModal isOpen={isOpen} onClose={onClose} />
      <Button onClick={onOpen} colorScheme="red">
        Delete your data
      </Button>
    </>
  );
}
