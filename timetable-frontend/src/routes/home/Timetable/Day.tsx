import { Block, Course } from "../../../utils/types";
import { Card, Flex, TabPanel } from "@chakra-ui/react";
import BlockDisplay from "./Day/BlockDisplay";
import TimetableGrid from "./Day/TimetableGrid";
import CurrentTime from "./Day/CurrentTime";

type Props = {
  week_day: number;
  blocks: Block[];
  courses: Course[];
  isCurrentDay: boolean;
};

export default function Day({
  week_day,
  blocks,
  courses,
  isCurrentDay,
}: Props) {
  return (
    <TabPanel
      p={0}
      pt={2}
      overflowX="auto"
      h="100%"
      maxW="100vw"
      tabIndex={week_day}
    >
      <Flex h="100%" justify="center">
        <Card overflow="hidden" w={300} h="100%">
          <TimetableGrid />

          {blocks.map((block) => {
            const courseMatches = courses.filter(
              (course) => course.id == block.course_id
            );
            if (courseMatches.length === 0) {
              console.error("Failed to find a matching course");
              return;
            }

            return (
              <BlockDisplay
                key={block.id}
                block={block}
                course={courseMatches[0]}
              />
            );
          })}
          {isCurrentDay ? <CurrentTime /> : null}
        </Card>
      </Flex>
    </TabPanel>
  );
}
