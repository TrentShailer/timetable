import { Block, Course } from "../../../utils/types";
import { Card, TabPanel } from "@chakra-ui/react";
import BlockDisplay from "./Day/BlockDisplay";
import TimetableGrid from "./Day/TimetableGrid";
import CurrentTime from "./Day/CurrentTime";
import { useEffect, useState } from "react";

type Props = {
    week_day: number;
    blocks: Block[];
    courses: Course[];
    isCurrentDay: boolean;
    blockColumns: Record<string, number>;
};

export default function Day({
    week_day,
    blocks,
    courses,
    isCurrentDay,
    blockColumns,
}: Props) {
    const [maxColumn, setMaxColumn] = useState(0);

    useEffect(() => {
        let max_column = 0;

        blocks.forEach((block) => {
            let column = blockColumns[block.id];
            if (column > maxColumn) {
                max_column = column;
            }
        });

        setMaxColumn(max_column);
    }, [blocks, blockColumns]);

    return (
        <TabPanel
            p={0}
            pt={2}
            overflowX="auto"
            h="100%"
            maxW="100vw"
            tabIndex={week_day}
        >
            <Card
                ml={`max(calc(50% - ${
                    (60 + 155 * (maxColumn + 1)) / 2
                }px), 0px)`}
                h="100%"
                w={60 + 155 * (maxColumn + 1)}
            >
                <TimetableGrid />

                {blocks.map((block) => {
                    const courseMatches = courses.filter(
                        (course) => course.id == block.course_id
                    );
                    if (courseMatches.length === 0) {
                        console.error("Failed to find a matching course");
                        return;
                    }

                    let column = blockColumns[block.id];
                    if (column === undefined) {
                        console.error(`Block: ${block} has no column`);
                        return;
                    }

                    return (
                        <BlockDisplay
                            key={block.id}
                            block={block}
                            course={courseMatches[0]}
                            column={column}
                        />
                    );
                })}
                {isCurrentDay ? <CurrentTime /> : null}
            </Card>
        </TabPanel>
    );
}
