import { Container, Heading, Text } from "@chakra-ui/react";
import Login from "./Landing/Login";

export default function Landing() {
  return (
    <Container maxW="lg" pt={24}>
      <Heading mb={4} size="3xl">
        Troublesome Timetables?
      </Heading>
      <Text mb={8} fontSize="lg">
        I kept getting logged out by VUW's timetable system, so I made this.
      </Text>
      <Login />
    </Container>
  );
}
