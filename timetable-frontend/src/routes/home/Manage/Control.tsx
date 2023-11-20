import { Flex } from "@chakra-ui/react";
import ImportCourse from "./Control/ImportCourse";
import NewCourse from "./Control/NewCourse";

type Props = {
  loading: boolean;
  refreshData: () => void;
};

export default function Control({ loading, refreshData }: Props) {
  return (
    <Flex gap={4} justifyContent="center">
      <ImportCourse loading={loading} refreshData={refreshData} />
      <NewCourse loading={loading} refreshData={refreshData} />
    </Flex>
  );
}
