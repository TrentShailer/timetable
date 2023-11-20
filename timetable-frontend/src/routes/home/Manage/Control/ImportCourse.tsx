import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { get_error_description, handle_401 } from "../../../../utils/errors";
import { useLocation } from "wouter";

type Props = {
  loading: boolean;
  refreshData: () => void;
};

export default function ImportCourse({ loading, refreshData }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [, setLocation] = useLocation();
  const toast = useToast();

  const [courseId, setCourseId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const closeModal = () => {
    if (submitting) return;
    setCourseId("");
    setError("");
    onClose();
  };

  const trySubmit = async () => {
    setSubmitting(true);
    if (courseId === "") {
      setError("Course ID must have a value.");
      setSubmitting(false);
      return;
    }

    if (
      !courseId.match(
        /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/
      )
    ) {
      setError("Course ID is invalid.");
      setSubmitting(false);
      return;
    }

    setError("");

    try {
      const response = await axios.post(
        "/course/import",
        { id: courseId },
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
          title: "No course with that ID exists.",
          status: "warning",
          duration: 3000,
        });
        setSubmitting(false);
        return;
      }

      refreshData();
      toast({
        title: "Successfully imported course.",
        status: "success",
        duration: 3000,
      });
      setSubmitting(false);
      closeModal();
    } catch (error) {
      console.error(error);
      const toast_description = get_error_description(error);
      toast({
        title: "Failed to import course",
        description: toast_description,
        duration: 5000,
        status: "error",
      });
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Import Course</ModalHeader>
          <ModalCloseButton isDisabled={submitting} />
          <ModalBody>
            <FormControl isInvalid={error !== ""}>
              <FormLabel>Course ID to Import</FormLabel>
              <Input
                isDisabled={submitting}
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    trySubmit();
                  }
                }}
              />
              <FormErrorMessage>{error}</FormErrorMessage>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              isDisabled={submitting}
              variant="ghost"
              mr={3}
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button
              isLoading={submitting}
              colorScheme="green"
              onClick={trySubmit}
            >
              Import Course
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Button isLoading={submitting} isDisabled={loading} onClick={onOpen}>
        Import Course
      </Button>
    </>
  );
}
