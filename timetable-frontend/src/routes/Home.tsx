import {
    Button,
    Container,
    Icon,
    IconButton,
    VStack,
    useToast,
} from "@chakra-ui/react";
import Header from "../components/Header";
import Timetable from "./home/Timetable";
import { useCallback, useEffect, useState } from "react";
import { Block, Course } from "../utils/types";
import axios from "axios";
import { get_error_description, handle_401 } from "../utils/errors";
import { useLocation } from "wouter";
import Manage from "./home/Manage";
import { IoRefresh } from "react-icons/io5";

export default function Home() {
    const toast = useToast();
    const [location, setLocation] = useLocation();

    const [managing, setManaging] = useState(false);
    const [loading, setLoading] = useState(true);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [blockColumns, setBlockColumns] = useState<Record<string, number>>(
        {}
    );

    const fetch_data = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get<{
                courses: Course[];
                blocks: Block[];
                block_columns: Record<string, number>;
            }>("/timetable", {
                validateStatus: (status) => status === 200 || status === 401,
            });

            if (response.status === 401) {
                if (location !== "/") handle_401(setLocation, toast);
                return;
            }

            setBlocks(response.data.blocks);
            setCourses(response.data.courses);
            setBlockColumns(response.data.block_columns);
        } catch (error) {
            console.error(error);
            const toast_description = get_error_description(error);
            toast({
                title: "Failed to fetch timetable",
                description: toast_description,
                duration: 5000,
                status: "error",
            });
        } finally {
            setLoading(false);
        }
    }, [setLocation, toast, location]);

    useEffect(() => {
        // Small delay to ensure any re-render on logout is ignored
        const timeout = setTimeout(() => {
            fetch_data();
        }, 50);

        return () => {
            clearTimeout(timeout);
        };
    }, [fetch_data]);

    return (
        <VStack gap={0} h="100%" w="100%">
            <Header>
                <Button mr={2} size="sm" onClick={() => setManaging(!managing)}>
                    {managing ? "Return to Timetable" : "Manage Courses"}
                </Button>
                <IconButton
                    size="sm"
                    onClick={() => fetch_data()}
                    icon={<Icon boxSize={5} as={IoRefresh} />}
                    aria-label={"Refresh timetable"}
                />
            </Header>
            <Container overflowY="auto" h="calc(100% - 60px)" pt={2} maxW="4xl">
                {managing ? (
                    <Manage
                        loading={loading}
                        blocks={blocks}
                        courses={courses}
                        refreshData={fetch_data}
                    />
                ) : (
                    <Timetable
                        loading={loading}
                        blocks={blocks}
                        courses={courses}
                        blockColumns={blockColumns}
                    />
                )}
            </Container>
        </VStack>
    );
}
