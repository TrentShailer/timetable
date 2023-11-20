import { HStack, Avatar, VStack, Heading, Text } from "@chakra-ui/react";

type Props = {
  picture: string | null;
  name: string;
  email: string;
};

export default function AccountCardLoaded({ picture, name, email }: Props) {
  return (
    <HStack>
      <Avatar src={picture == null ? undefined : picture} />
      <VStack alignItems="left" spacing={0}>
        <Heading size="md">{name}</Heading>
        <Text color="whiteAlpha.500">{email}</Text>
      </VStack>
    </HStack>
  );
}
