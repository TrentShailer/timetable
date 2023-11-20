import { Box, Divider, Flex, Spacer } from "@chakra-ui/react";
import AccountMenu from "./Header/AccountMenu";
import { ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export default function Header({ children }: Props) {
  return (
    <Box h="60px" flexShrink="0" id="header" w="100%">
      <Flex h="100%" alignItems="center" pl={2}>
        {children !== undefined ? children : null}
        <Spacer />
        <AccountMenu />
      </Flex>
      <Divider />
    </Box>
  );
}
