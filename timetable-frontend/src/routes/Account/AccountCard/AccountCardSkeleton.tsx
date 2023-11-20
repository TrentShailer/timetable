import { HStack, Skeleton, SkeletonCircle } from "@chakra-ui/react";

export default function AccountCardSkeleton() {
  return (
    <HStack>
      <SkeletonCircle size="12" />
      <Skeleton w="75%" h="48px" />
    </HStack>
  );
}
