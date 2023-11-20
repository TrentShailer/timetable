import { Box, Container, Heading } from "@chakra-ui/react";
import Header from "../components/Header";
import AccountCard from "./Account/AccountCard";
import Data from "./Account/Data";

export default function Account() {
  return (
    <Box>
      <Header />
      <Container pt={12} maxW="4xl">
        <Heading mb={4}>Your Account</Heading>
        <Box mb={4}>
          <AccountCard />
        </Box>
        <Box>
          <Data />
        </Box>
      </Container>
    </Box>
  );
}
