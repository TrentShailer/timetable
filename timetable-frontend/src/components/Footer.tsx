import {
  Box,
  ButtonGroup,
  Flex,
  IconButton,
  Spacer,
  Text,
  Icon,
  Link,
} from "@chakra-ui/react";
import { SiGithub, SiLinkedin } from "react-icons/si";
import { FiExternalLink } from "react-icons/fi";

export default function Footer() {
  return (
    <Flex align="center" flexShrink="0" w="100%" h="60px" gap={2} pl={4} pr={4}>
      <Box>
        <Text color="whiteAlpha.700">
          Made by Trent Shailer with design inspired by{" "}
          <Link href="https://www.gradekeeper.xyz" isExternal>
            Gradekeeper <Icon as={FiExternalLink} />
          </Link>
        </Text>
      </Box>
      <Spacer />
      <ButtonGroup gap="2">
        <Box as="a" href="https://github.com/TrentShailer">
          <IconButton
            aria-label="Open Trent's Github"
            icon={<Icon boxSize={7} color="whiteAlpha.600" as={SiGithub} />}
          />
        </Box>

        <Box as="a" href="https://www.linkedin.com/in/trent-shailer-9916211bb/">
          <IconButton
            aria-label="Open Trent's Linkedin"
            icon={<Icon boxSize={7} color="whiteAlpha.600" as={SiLinkedin} />}
          />
        </Box>
      </ButtonGroup>
    </Flex>
  );
}
