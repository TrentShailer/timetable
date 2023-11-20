import {
  Card,
  CardBody,
  Divider,
  HStack,
  Spacer,
  Table,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Block, Course } from "../../../utils/types";
import CourseName from "./CourseDisplay/CourseName";
import BlockDisplay from "./CourseDisplay/BlockDisplay";
import NewTimeblock from "./CourseDisplay/NewTimeblock";
import DeleteCourse from "./CourseDisplay/DeleteCourse";
import CopyCourse from "./CourseDisplay/CopyCourse";

type Props = {
  blocks: Block[];
  course: Course;
  refreshData: () => void;
};

export default function CourseDisplay({ blocks, course, refreshData }: Props) {
  return (
    <Card w="100%">
      <CardBody>
        <HStack>
          <CourseName course={course} refreshData={refreshData} />
          <Spacer />
          <CopyCourse course={course} />
          <NewTimeblock course={course} refreshData={refreshData} />
          <DeleteCourse course={course} refreshData={refreshData} />
        </HStack>
        <Divider mt={2} mb={2} />
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Weekday</Th>
                <Th>Type</Th>
                <Th>Loction</Th>
                <Th>Start Time</Th>
                <Th>End Time</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {blocks.map((block) => (
                <BlockDisplay
                  key={block.id}
                  block={block}
                  course={course}
                  refreshData={refreshData}
                />
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </CardBody>
    </Card>
  );
}
