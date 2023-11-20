import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Text,
  useToast,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import { useState } from "react";
import { Course } from "../../../../utils/types";
import { get_error_description, handle_401 } from "../../../../utils/errors";
import { useLocation } from "wouter";
import axios from "axios";
import { IoMdTrash } from "react-icons/io";

type Props = {
  course: Course;
  refreshData: () => void;
};

export default function DeleteCourse({ course, refreshData }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const [, setLocation] = useLocation();

  const controlledClose = () => {
    if (loading) return;
    onClose();
  };

  const tryDeleteCourse = async () => {
    setLoading(true);
    try {
      const response = await axios.delete(`/course/${course.id}`, {
        validateStatus: (status) =>
          status === 200 || status === 401 || status === 404,
      });

      if (response.status === 401) {
        handle_401(setLocation, toast);
        return;
      }

      if (response.status === 404) {
        setLoading(false);
        onClose();
        refreshData();
        toast({
          title: "This course no longer exists",
          status: "warning",
          duration: 3000,
        });
        return;
      }
      setLoading(false);
      onClose();
      refreshData();
      toast({
        title: "Course successfully deleted",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error(error);
      const toast_description = get_error_description(error);
      toast({
        title: "Failed to delete course",
        description: toast_description,
        duration: 5000,
        status: "error",
      });
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={controlledClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Course {course.name}?</ModalHeader>
          <ModalCloseButton isDisabled={loading} />
          <ModalBody>
            <Text>Deleting this course cannot be undone.</Text>
            <Text>
              This will delete the course and all associated timeblocks.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button isDisabled={loading} mr={5} onClick={controlledClose}>
              Cancel
            </Button>
            <Button
              isLoading={loading}
              colorScheme="red"
              onClick={tryDeleteCourse}
            >
              Delete Course
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <IconButton
        size="sm"
        aria-label="Delete Course"
        colorScheme="red"
        onClick={onOpen}
        icon={<Icon boxSize={5} as={IoMdTrash} />}
      />
    </>
  );
}
