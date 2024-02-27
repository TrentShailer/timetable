import { Box, Text } from "@chakra-ui/react";
import dayjs from "dayjs";

export const startHour = 7;
export const nHours = 12;

export default function TimetableGrid() {
    return (
        <Box h="100%" w={"100%"}>
            {Array.from(Array(nHours).keys()).map((_, i) => (
                <Box
                    key={i}
                    h={`${100 / nHours}%`}
                    w={"100%"}
                    borderColor="gray.600"
                    borderWidth="1px"
                    borderLeft="none"
                    borderRight="none"
                >
                    <Text pl={1} fontSize="sm" color="gray.600">
                        {dayjs(`${startHour + i}`, "HH").format("h:mma")}
                    </Text>
                </Box>
            ))}
        </Box>
    );
}
