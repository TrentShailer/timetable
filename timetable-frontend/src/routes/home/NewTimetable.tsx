import { Container, Divider } from "@chakra-ui/react";
import { Block, Course } from "../../utils/types";
import DaySelector from "./NewTimetable/DaySelector";
import { useState } from "react";
import { get_week_day } from "../../utils/week_day";
import Day from "./NewTimetable/Day";

type Props = {
    loading: boolean;
    blocks: Block[];
    courses: Course[];
    blockColumns: Record<string, number>;
};

export default function NewTimetable({
    loading,
    blocks,
    courses,
    blockColumns,
}: Props) {
    const [selected_day, set_selected_day] = useState(get_week_day());
    return (
        <>
            <DaySelector
                day={0}
                selected_day={selected_day}
                set_selected_day={(day: number) => {
                    set_selected_day(day);
                }}
            />
            <Divider />
            <Container mt={4}>
                <Day
                    day={selected_day}
                    blocks={blocks}
                    courses={courses}
                    blockColumns={blockColumns}
                />
            </Container>
        </>
    );
}
