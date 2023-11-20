import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { userAtom } from "../../../../utils/state";
import { useAtom } from "jotai";
import { useLocation } from "wouter";
import { get_error_description, handle_401 } from "../../../../utils/errors";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function DeleteModal({ isOpen, onClose }: Props) {
  const [, setUser] = useAtom(userAtom);
  const [, setLocation] = useLocation();
  const toast = useToast();

  const [loading, setLoading] = useState(false);

  const controlledClose = () => {
    if (loading) return;
    onClose();
  };

  const tryDeleteUserData = async () => {
    setLoading(true);

    try {
      const response = await axios.delete("/user_data", {
        validateStatus: (status) => status === 200 || status === 401,
      });

      if (response.status === 401) {
        handle_401(setLocation, toast);
        return;
      }

      setUser(null);
      setLocation("/");
      toast({
        title: "Successfully deleted all user data",
        status: "success",
        duration: 5000,
      });
    } catch (error) {
      console.error(error);
      const toast_description = get_error_description(error);
      toast({
        title: "Failed to delete user data",
        description: toast_description,
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={controlledClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete all user data?</ModalHeader>
        <ModalCloseButton isDisabled={loading} />
        <ModalBody>
          <Text>Deleting all user data cannot be undone.</Text>
          <Text>
            This will delete your account, personal information, courses, and
            time blocks.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button isDisabled={loading} mr={5} onClick={controlledClose}>
            Cancel
          </Button>
          <Button
            isLoading={loading}
            colorScheme="red"
            onClick={tryDeleteUserData}
          >
            Delete user data
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
