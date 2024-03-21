import { Container, Flex, Spinner, VStack } from "@chakra-ui/react";
import { Block, Course } from "../../utils/types";
import Control from "./Manage/Control";
import CourseDisplay from "./Manage/CourseDisplay";

type Props = {
    loading: boolean;
    blocks: Block[];
    courses: Course[];
    refreshData: () => void;
};

export default function Manage({
    loading,
    blocks,
    courses,
    refreshData,
}: Props) {
    return (
        <Container maxW="4xl">
            <VStack gap={4}>
                <Control loading={loading} refreshData={refreshData} />
                <VStack id="Test" w="100%" overflowY="auto" flexGrow="1">
                    {loading ? (
                        <Flex justifyContent="center">
                            <Spinner size="lg" />
                        </Flex>
                    ) : (
                        courses.map((course) => (
                            <CourseDisplay
                                key={course.id}
                                course={course}
                                blocks={blocks.filter(
                                    (block) => block.course_id === course.id
                                )}
                                refreshData={refreshData}
                            />
                        ))
                    )}
                </VStack>
            </VStack>
        </Container>
    );
}
