import {
	Badge,
	Button,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Table,
	TableContainer,
	Tbody,
	Td,
	Text,
	Tr,
} from "@chakra-ui/react";
import { Block, Course } from "../../../../../utils/types";
import dayjs from "dayjs";

type Props = {
	block: Block;
	course: Course;
	isOpen: boolean;
	onClose: () => void;
};

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Details({ block, course, isOpen, onClose }: Props) {
	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>
					{course.name} {block.block_type}
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<TableContainer>
						<Table>
							<Tbody>
								<Tr>
									<Td pl={0} pt={0} isNumeric>
										<Badge>Day</Badge>
									</Td>
									<Td pl={0} pt={0} pr={0}>
										<Text>{WEEKDAYS[block.week_day]}</Text>
									</Td>
								</Tr>
								<Tr>
									<Td pl={0} pt={0} isNumeric>
										<Badge>Location</Badge>
									</Td>
									<Td pl={0} pt={0} pr={0}>
										<Text>{block.location}</Text>
									</Td>
								</Tr>
								<Tr>
									<Td pl={0} pt={0} isNumeric>
										<Badge>Time</Badge>
									</Td>
									<Td pl={0} pt={0} pr={0}>
										<Text>
											{dayjs(block.start_time, "HH:mm:ss").format("h:mm a")}
											{" — "}
											{dayjs(block.end_time, "HH:mm:ss").format("h:mm a")}
										</Text>
									</Td>
								</Tr>
								<Tr>
									<Td isNumeric pl={0} pt={0}>
										<Badge>Notes</Badge>
									</Td>
									<Td pl={0} pt={0} pr={0}>
										<Text whiteSpace={"pre-wrap"}>{block.notes}</Text>
									</Td>
								</Tr>
							</Tbody>
						</Table>
					</TableContainer>
				</ModalBody>
				<ModalFooter>
					<Button mr={5} onClick={onClose}>
						Close
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
