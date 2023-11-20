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

export default function NewCourse({ loading, refreshData }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [, setLocation] = useLocation();
  const toast = useToast();

  const [courseName, setCourseName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const closeModal = () => {
    if (submitting) return;
    setCourseName("");
    setError("");
    onClose();
  };

  const trySubmit = async () => {
    setSubmitting(true);
    if (courseName === "") {
      setError("Course Name must have a value.");
      setSubmitting(false);
      return;
    }

    if (courseName.length > 10) {
      setError("Course Name is too long (max 10 chars).");
      setSubmitting(false);
      return;
    }

    if (!courseName.match(/[a-zA-Z0-9]+/)) {
      setSubmitting(false);
      toast({
        title: "Course name contain at least 1 valid character",
        description: "A valid character is any letter or number",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setError("");

    try {
      const response = await axios.post(
        "/course",
        { name: courseName },
        {
          validateStatus: (status) => status === 200 || status === 401,
        }
      );
      if (response.status === 401) {
        handle_401(setLocation, toast);
        return;
      }

      refreshData();
      setSubmitting(false);
      toast({
        title: "Successfully created course.",
        status: "success",
        duration: 3000,
      });
      closeModal();
    } catch (error) {
      console.error(error);
      const toast_description = get_error_description(error);
      toast({
        title: "Failed to create course",
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
          <ModalHeader>New Course</ModalHeader>
          <ModalCloseButton isDisabled={submitting} />
          <ModalBody>
            <FormControl isInvalid={error !== ""}>
              <FormLabel>Course Name</FormLabel>
              <Input
                isDisabled={submitting}
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
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
              Create Course
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Button isLoading={submitting} isDisabled={loading} onClick={onOpen}>
        New Course
      </Button>
    </>
  );
}
