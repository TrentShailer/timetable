import {
  ButtonGroup,
  HStack,
  Icon,
  IconButton,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Course } from "../../../../utils/types";
import { useState } from "react";
import { MdEdit } from "react-icons/md";
import { IoCheckmarkOutline, IoCloseOutline } from "react-icons/io5";
import { useLocation } from "wouter";
import axios from "axios";
import { get_error_description, handle_401 } from "../../../../utils/errors";

type Props = {
  course: Course;
  refreshData: () => void;
};

export default function CourseName({ course, refreshData }: Props) {
  const [name, setName] = useState(course.name);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const toast = useToast();
  const [, setLocation] = useLocation();

  const trySubmit = async () => {
    setLoading(true);
    if (name.length > 10) {
      setLoading(false);
      toast({
        title: "New name is too long",
        description: "Course name must not be longer than 10 characters",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (name === "") {
      setLoading(false);
      toast({
        title: "Course name must have a value",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (!name.match(/[a-zA-Z0-9]+/)) {
      setLoading(false);
      toast({
        title: "Course name contain at least 1 valid character",
        description: "A valid character is any letter or number",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      const response = await axios.put(
        `/course/${course.id}`,
        { name },
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
          title: "This course no longer exists",
          status: "warning",
          duration: 3000,
        });
        refreshData();
        setLoading(false);
        return;
      }

      refreshData();
      setLoading(false);
      toast({
        title: "Course name successfully updated",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error(error);
      const toast_description = get_error_description(error);
      toast({
        title: "Failed to update name",
        description: toast_description,
        status: "error",
        duration: 5000,
      });
      setLoading(false);
    }
  };

  return (
    <>
      {editing ? (
        <HStack>
          <Input
            autoFocus={true}
            size="sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                trySubmit();
              }
            }}
          />
          <ButtonGroup size="sm">
            <IconButton
              aria-label="Submit course name edit"
              icon={<Icon as={IoCheckmarkOutline} />}
              isLoading={loading}
              onClick={trySubmit}
            />
            <IconButton
              isDisabled={loading}
              aria-label="Cancel course name edit"
              icon={<Icon as={IoCloseOutline} />}
              onClick={() => {
                setName(course.name);
                setEditing(false);
              }}
            />
          </ButtonGroup>
        </HStack>
      ) : (
        <HStack>
          <Text>{course.name}</Text>
          <IconButton
            onClick={() => setEditing(true)}
            isDisabled={loading}
            variant="ghost"
            aria-label="Edit course name"
            size="sm"
            icon={<Icon as={MdEdit} />}
          />
        </HStack>
      )}
    </>
  );
}
