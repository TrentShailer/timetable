import {
	Button,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	useDisclosure,
	useToast,
	FormControl,
	FormLabel,
	FormErrorMessage,
	Input,
	VStack,
	RadioGroup,
	Radio,
	Flex,
	IconButton,
	Icon,
	Textarea,
} from "@chakra-ui/react";
import { Course } from "../../../../utils/types";
import { useState } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import { IoMdAdd } from "react-icons/io";
import { get_error_description, handle_401 } from "../../../../utils/errors";

type Props = {
	course: Course;
	refreshData: () => void;
};

export default function NewTimeblock({ course, refreshData }: Props) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [loading, setLoading] = useState(false);

	const [weekday, setWeekday] = useState(0);
	const [weekdayError, setWeekdayError] = useState("");

	const [blockLocation, setBlockLocation] = useState("");
	const [blockLocationError, setBlockLocationError] = useState("");

	const [blockType, setBlockType] = useState("");
	const [blockTypeError, setBlockTypeError] = useState("");

	const [startTime, setStartTime] = useState("");
	const [startTimeError, setStartTimeError] = useState("");

	const [endTime, setEndTime] = useState("");
	const [endTimeError, setEndTimeError] = useState("");

	const [notes, setNotes] = useState("");

	const toast = useToast();
	const [, setLocation] = useLocation();

	const controlledClose = () => {
		if (loading) return;
		setWeekday(0);
		setWeekdayError("");
		setBlockLocation("");
		setBlockLocationError("");
		setBlockType("");
		setBlockTypeError("");
		setStartTime("");
		setStartTimeError("");
		setEndTime("");
		setEndTimeError("");
		setNotes("");

		onClose();
	};

	const validateFields = (): boolean => {
		let allValid = true;

		if (weekday === undefined) {
			allValid = false;
			setWeekdayError("Weekday is required.");
		}

		if (blockLocation === "" || blockLocation === undefined) {
			allValid = false;
			setBlockLocationError("Location is required.");
		}

		if (!blockLocation.match(/[a-zA-Z0-9]+/)) {
			allValid = false;
			setBlockLocationError("Location must contain at least one number or letter.");
		}

		if (blockLocation.length > 10) {
			allValid = false;
			setBlockLocationError("Location must at most 10 characters.");
		}

		if (blockType === "") {
			allValid = false;
			setBlockTypeError("Block Type is required.");
		}

		if (startTime === "") {
			allValid = false;
			setStartTimeError("Start Time must have a value.");
		}

		if (endTime === "") {
			allValid = false;
			setEndTimeError("End Time must have a value.");
		}

		return allValid;
	};

	const tryCreateTimeblock = async () => {
		setLoading(true);

		if (validateFields() === false) {
			setLoading(false);
			return;
		}

		try {
			const response = await axios.post(
				`/course/${course.id}/block`,
				{
					block_type: blockType,
					week_day: weekday,
					start_time: startTime + ":00",
					end_time: endTime + ":00",
					location: blockLocation,
					notes: notes === "" ? null : notes,
				},
				{ validateStatus: (status) => status === 200 || status === 401 }
			);

			if (response.status === 401) {
				handle_401(setLocation, toast);
				return;
			}

			refreshData();
			setLoading(false);
			onClose();
			toast({
				title: "Successfully Created Timeblock",
				status: "success",
				duration: 3000,
			});
		} catch (error) {
			console.error(error);
			const toast_description = get_error_description(error);
			toast({
				title: "Failed to create timeblock",
				description: toast_description,
				duration: 5000,
				status: "error",
			});
			setLoading(false);
		}
	};

	return (
		<>
			<Modal isOpen={isOpen} onClose={controlledClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>New Timeblock</ModalHeader>
					<ModalCloseButton isDisabled={loading} />
					<ModalBody>
						<VStack gap={2}>
							<FormControl isInvalid={weekdayError !== ""}>
								<FormLabel>Weekday</FormLabel>
								<RadioGroup
									value={weekday.toString()}
									onChange={(v) => setWeekday(Number.parseInt(v))}
								>
									<Flex dir="row" wrap="wrap" gap={2}>
										<Radio value="0">Sunday</Radio>
										<Radio value="1">Monday</Radio>
										<Radio value="2">Tuesday</Radio>
										<Radio value="3">Wednesday</Radio>
										<Radio value="4">Thursday</Radio>
										<Radio value="5">Friday</Radio>
										<Radio value="6">Saturday</Radio>
									</Flex>
								</RadioGroup>
								<FormErrorMessage>{weekdayError}</FormErrorMessage>
							</FormControl>

							<FormControl isInvalid={blockTypeError !== ""}>
								<FormLabel>Block Type</FormLabel>
								<RadioGroup value={blockType} onChange={setBlockType}>
									<Flex dir="row" wrap="wrap" gap={2}>
										<Radio value={"Lecture"}>Lecture</Radio>
										<Radio value={"Lab"}>Lab</Radio>
										<Radio value={"Tutorial"}>Tutorial</Radio>
										<Radio value={"Other"}>Other</Radio>
									</Flex>
								</RadioGroup>
								<FormErrorMessage>{blockTypeError}</FormErrorMessage>
							</FormControl>

							<FormControl isInvalid={blockLocationError !== ""}>
								<FormLabel>Location</FormLabel>
								<Input
									value={blockLocation}
									onChange={(e) => {
										setBlockLocation(e.target.value);
									}}
									placeholder="Enter Location"
								/>
								<FormErrorMessage>{blockLocationError}</FormErrorMessage>
							</FormControl>

							<FormControl isInvalid={startTimeError !== ""}>
								<FormLabel>Start Time</FormLabel>
								<Input
									value={startTime}
									onChange={(e) => {
										setStartTime(e.target.value);
									}}
									type="time"
								/>
								<FormErrorMessage>{startTimeError}</FormErrorMessage>
							</FormControl>

							<FormControl isInvalid={endTimeError !== ""}>
								<FormLabel>End Time</FormLabel>
								<Input
									value={endTime}
									onChange={(e) => {
										setEndTime(e.target.value);
									}}
									type="time"
								/>
								<FormErrorMessage>{endTimeError}</FormErrorMessage>
							</FormControl>
							<FormControl>
								<FormLabel>Notes</FormLabel>
								<Textarea
									value={notes}
									onChange={(e) => {
										setNotes(e.target.value);
									}}
								/>
							</FormControl>
						</VStack>
					</ModalBody>
					<ModalFooter>
						<Button isDisabled={loading} mr={5} onClick={controlledClose}>
							Cancel
						</Button>
						<Button
							isLoading={loading}
							colorScheme="green"
							onClick={tryCreateTimeblock}
						>
							Create Timeblock
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
			<IconButton
				onClick={onOpen}
				aria-label="New Timeblock"
				size="sm"
				colorScheme="blue"
				icon={<Icon boxSize={5} as={IoMdAdd} />}
			/>
		</>
	);
}
