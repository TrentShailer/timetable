import { Card, HStack, Heading, VStack, Text } from "@chakra-ui/react";
import { Block, Course } from "../../../../utils/types";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { nHours, startHour as timetableStartHour } from "./TimetableGrid";

type Props = {
  block: Block;
  course: Course;
};

export default function BlockDisplay({ block, course }: Props) {
  const [top, setTop] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const startHour = Number.parseInt(block.start_time.substring(0, 2));
    const startMinute = Number.parseInt(block.start_time.substring(3, 5));
    const startMinutes = startHour * 60 + startMinute;

    const minuteSize = 100 / nHours / 60;

    const timetableStartMinutes = timetableStartHour * 60;
    const startDiff = startMinutes - timetableStartMinutes;

    setTop(startDiff * minuteSize);

    const endHour = Number.parseInt(block.end_time.substring(0, 2));
    const endMinute = Number.parseInt(block.end_time.substring(3, 5));
    const endMinutes = endHour * 60 + endMinute;

    const timeDiff = Math.abs(endMinutes - startMinutes);
    setHeight(timeDiff * minuteSize);
  }, [block]);

  return (
    <Card
      top={`${top}%`}
      right={0}
      p={2}
      pt={0}
      pb={0}
      pos="absolute"
      w={225}
      h={`${height}%`}
      bg="gray.600"
    >
      <HStack align="start" h="100%">
        <VStack gap={0} w="100%" align="start">
          <Heading fontSize="sm">
            {course.name} {block.block_type}
          </Heading>
          <Text fontSize="sm">{block.location}</Text>
        </VStack>
        <VStack gap={0} justify="space-between" h="100%" align="end">
          <Text fontSize="sm">
            {dayjs(block.start_time, "HH:mm:ss").format("h:mma")}
          </Text>
          <Text fontSize="sm">
            {dayjs(block.end_time, "HH:mm:ss").format("h:mma")}
          </Text>
        </VStack>
      </HStack>
    </Card>
  );
}
