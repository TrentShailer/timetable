import {
  Avatar,
  Button,
  Icon,
  MenuButton,
  Skeleton,
  SkeletonCircle,
} from "@chakra-ui/react";
import { useAtom } from "jotai";
import { BiChevronDown } from "react-icons/bi";
import { userAtom } from "../../../utils/state";

export default function AccountMenuButton() {
  const [user] = useAtom(userAtom);

  return (
    <MenuButton
      isDisabled={user == null}
      m={2}
      as={Button}
      colorScheme="purple"
      leftIcon={
        user == null ? (
          <SkeletonCircle size="8" />
        ) : (
          <Avatar
            bg="purple.500"
            size="sm"
            name={user.name}
            src={user.picture == null ? undefined : user.picture}
          />
        )
      }
      rightIcon={<Icon boxSize={5} as={BiChevronDown} />}
    >
      {user == null ? <Skeleton w={40} h={6} /> : user.name}
    </MenuButton>
  );
}
