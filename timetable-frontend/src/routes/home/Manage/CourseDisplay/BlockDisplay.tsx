import { ButtonGroup, Td, Tr } from "@chakra-ui/react";
import { Block, Course } from "../../../../utils/types";
import { week_day_string } from "../../../../utils/week_day";
import dayjs from "dayjs";
import DeleteBlock from "./BlockDisplay/DeleteBlock";
import EditBlock from "./BlockDisplay/EditBlock";

type Props = {
  block: Block;
  course: Course;
  refreshData: () => void;
};

export default function BlockDisplay({ block, course, refreshData }: Props) {
  return (
    <Tr>
      <Td>{week_day_string(block.week_day)}</Td>
      <Td>{block.block_type}</Td>
      <Td>{block.location}</Td>
      <Td>{dayjs(block.start_time, "HH:mm:ss").format("h:mm a")}</Td>
      <Td>{dayjs(block.end_time, "HH:mm:ss").format("h:mm a")}</Td>
      <Td>
        <ButtonGroup>
          <EditBlock course={course} block={block} refreshData={refreshData} />
          <DeleteBlock
            course={course}
            block={block}
            refreshData={refreshData}
          />
        </ButtonGroup>
      </Td>
    </Tr>
  );
}
