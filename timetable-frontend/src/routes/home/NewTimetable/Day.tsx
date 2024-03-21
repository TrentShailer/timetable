import { Card } from "@chakra-ui/react";
import { Block, Course } from "../../../utils/types";

type Props = {
    day: number;
    blocks: Block[];
    courses: Course[];
    blockColumns: Record<string, number>;
};

export default function Day({ day, blocks, courses, blockColumns }: Props) {
    return <Card h="750px">Day</Card>;
}
