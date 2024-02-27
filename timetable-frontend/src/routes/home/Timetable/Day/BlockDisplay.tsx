import { Card, HStack, Heading, VStack, Text } from "@chakra-ui/react";
import { Block, Course } from "../../../../utils/types";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { nHours, startHour as timetableStartHour } from "./TimetableGrid";
import Details from "./BlockDisplay/Details";

type Props = {
    block: Block;
    course: Course;
    column: number;
};

export default function BlockDisplay({ block, course, column }: Props) {
    const [top, setTop] = useState(0);
    const [height, setHeight] = useState(0);
    const [detailsOpen, setDetailsOpen] = useState(false);

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
            left={75 + 225 * column}
            overflowY={"auto"}
            p={2}
            pt={0}
            pb={0}
            pos="absolute"
            w={225}
            h={`${height}%`}
            bg="gray.600"
            style={{
                cursor: "pointer",
                userSelect: "none",
            }}
            onClick={() => {
                setDetailsOpen(true);
            }}
        >
            <HStack align="start" h="100%">
                <VStack gap={0} w="100%" align="start" flexGrow={2}>
                    <Heading fontSize="sm">
                        {course.name} {block.block_type}
                        {block.notes !== null ? "*" : null}
                    </Heading>
                    <Text fontSize="sm">{block.location}</Text>
                </VStack>
                <VStack
                    gap={0}
                    w="100%"
                    justify="space-between"
                    h="100%"
                    align="end"
                    flexShrink={2}
                >
                    <Text fontSize="sm">
                        {dayjs(block.start_time, "HH:mm:ss").format("h:mma")}
                    </Text>
                    <Text fontSize="sm">
                        {dayjs(block.end_time, "HH:mm:ss").format("h:mma")}
                    </Text>
                </VStack>
            </HStack>
            <Details
                block={block}
                course={course}
                isOpen={detailsOpen}
                onClose={() => {
                    setDetailsOpen(false);
                }}
            />
        </Card>
    );
}
