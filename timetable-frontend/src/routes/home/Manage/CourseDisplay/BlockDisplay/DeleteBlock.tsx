import {
  Button,
  Icon,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { IoMdTrash } from "react-icons/io";
import { useLocation } from "wouter";
import { Block, Course } from "../../../../../utils/types";
import { get_error_description, handle_401 } from "../../../../../utils/errors";

type Props = {
  course: Course;
  block: Block;
  refreshData: () => void;
};

export default function DeleteBlock({ course, block, refreshData }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const [, setLocation] = useLocation();

  const controlledClose = () => {
    if (loading) return;
    onClose();
  };

  const tryDeleteBlock = async () => {
    setLoading(true);
    try {
      const response = await axios.delete(
        `/course/${course.id}/block/${block.id}`,
        {
          validateStatus: (status) =>
            status === 200 || status === 401 || status === 404,
        }
      );

      if (response.status === 401) {
        handle_401(setLocation, toast);
        return;
      }

      if (response.status === 404) {
        toast({
          title: "This block no longer exists",
          status: "warning",
          duration: 3000,
        });
        refreshData();
        onClose();
        setLoading(false);
      }

      toast({
        title: "Successfully deleted block",
        status: "success",
        duration: 3000,
      });
      refreshData();
      onClose();
      setLoading(false);
    } catch (error) {
      console.error(error);
      const toast_description = get_error_description(error);
      toast({
        title: "Failed to delete timeblock",
        description: toast_description,
        duration: 5000,
        status: "error",
      });
      setLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={controlledClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Block?</ModalHeader>
          <ModalCloseButton isDisabled={loading} />
          <ModalBody>
            <Text>Deleting this block cannot be undone.</Text>
          </ModalBody>
          <ModalFooter>
            <Button isDisabled={loading} mr={5} onClick={controlledClose}>
              Cancel
            </Button>
            <Button
              isLoading={loading}
              colorScheme="red"
              onClick={tryDeleteBlock}
            >
              Delete Block
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <IconButton
        onClick={onOpen}
        aria-label="Delete Timeblock"
        size="xs"
        colorScheme="red"
        icon={<Icon boxSize={4} as={IoMdTrash} />}
      />
    </>
  );
}
