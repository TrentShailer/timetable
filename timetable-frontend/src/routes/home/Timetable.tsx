import {
  Divider,
  Flex,
  Spinner,
  Tab,
  TabList,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import React, { ReactElement, useCallback, useEffect, useState } from "react";
import Day from "./Timetable/Day";
import { Block, Course } from "../../utils/types";
import { get_week_day } from "../../utils/week_day";

type Props = {
  loading: boolean;
  blocks: Block[];
  courses: Course[];
};

export default function Timetable({ loading, blocks, courses }: Props) {
  const [currentDay, setCurrentDay] = useState(get_week_day());
  const [tabIndex, setTabIndex] = useState(get_week_day());
  const [dayElements, setDayElements] = useState<ReactElement[]>([]);

  const build_days = useCallback((): React.ReactElement[] => {
    if (blocks === undefined || courses === undefined) return [];

    const days: React.ReactElement[] = [];
    for (let i = 0; i < 7; i++) {
      const day_blocks = blocks.filter((block) => block.week_day === i);
      days.push(
        <Day
          key={i}
          isCurrentDay={currentDay === i}
          week_day={i}
          blocks={day_blocks}
          courses={courses}
        />
      );
    }

    return days;
  }, [blocks, courses, currentDay]);

  useEffect(() => {
    setDayElements(build_days());
  }, [currentDay, build_days]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDay(get_week_day());
    }, 1000 * 60 * 10);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Flex h="100%" justifyContent="center">
      <Tabs
        variant="soft-rounded"
        colorScheme="purple"
        display="flex"
        flexDir="column"
        index={tabIndex}
        h="100%"
        onChange={(index) => setTabIndex(index)}
      >
        <TabList pl={2} pr={2} pb={2} maxW="100vw" overflowX="auto">
          <Tab color={currentDay === 0 ? "green.500" : undefined}>Sunday</Tab>
          <Tab color={currentDay === 1 ? "green.500" : undefined}>Monday</Tab>
          <Tab color={currentDay === 2 ? "green.500" : undefined}>Tuesday</Tab>
          <Tab color={currentDay === 3 ? "green.500" : undefined}>
            Wednesday
          </Tab>
          <Tab color={currentDay === 4 ? "green.500" : undefined}>Thursday</Tab>
          <Tab color={currentDay === 5 ? "green.500" : undefined}>Friday</Tab>
          <Tab color={currentDay === 6 ? "green.500" : undefined}>Saturday</Tab>
        </TabList>
        <Divider />
        <TabPanels flexGrow="1">
          {loading ? (
            <Flex justifyContent="center">
              <Spinner mt={4} size="xl" />
            </Flex>
          ) : (
            dayElements
          )}
        </TabPanels>
      </Tabs>
    </Flex>
  );
}
