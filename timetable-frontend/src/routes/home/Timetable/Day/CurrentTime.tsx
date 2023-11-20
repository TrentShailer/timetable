import { Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { nHours, startHour } from "./TimetableGrid";

export default function CurrentTime() {
  const [top, setTop] = useState(0);
  const updatePosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    const minuteSize = 100 / (nHours * 60);

    const startMinutes = startHour * 60;
    const diff = totalMinutes - startMinutes;
    setTop(diff * minuteSize);
  };

  useEffect(() => {
    updatePosition();
    const interval = setInterval(updatePosition, 1000 * 30);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Box
      top={`${top}%`}
      pos="absolute"
      h="2px"
      opacity="75%"
      w="100%"
      bg="purple.300"
    />
  );
}
