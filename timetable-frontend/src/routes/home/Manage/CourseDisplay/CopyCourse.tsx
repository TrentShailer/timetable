import { Icon, IconButton, useToast } from "@chakra-ui/react";
import { Course } from "../../../../utils/types";
import { IoIosCopy } from "react-icons/io";

type Props = {
  course: Course;
};

export default function CopyCourse({ course }: Props) {
  const toast = useToast();

  const copyCourseId = () => {
    navigator.clipboard
      .writeText(course.id)
      .then(() => {
        toast({ title: "Copied Course ID", duration: 3000, status: "success" });
      })
      .catch((error) => {
        console.error(error);
        toast({ title: "Failed to Copy Course ID", status: "error" });
      });
  };
  return (
    <IconButton
      size="sm"
      aria-label="Copy Course ID"
      onClick={copyCourseId}
      icon={<Icon boxSize={5} as={IoIosCopy} />}
    />
  );
}
