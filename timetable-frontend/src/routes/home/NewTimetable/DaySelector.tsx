import { Button, Container, HStack } from "@chakra-ui/react";
import { week_day_string } from "../../../utils/week_day";
import { useEffect, useState } from "react";

type Props = {
    day: number;
    selected_day: number;
    set_selected_day: (day: number) => void;
};

export default function DaySelector({
    day,
    selected_day,
    set_selected_day,
}: Props) {
    return (
        <Container maxW="2xl" w="100%" overflowX="auto" pb={2}>
            <HStack w="fit-content">
                {[...Array(7).keys()].map((button_day) => (
                    <DayButton
                        key={button_day}
                        day={button_day}
                        current_day={day}
                        selected_day={selected_day}
                        on_click={set_selected_day}
                    />
                ))}
            </HStack>
        </Container>
    );
}

type DayButtonProps = {
    day: number;
    current_day: number;
    selected_day: number;
    on_click: (day: number) => void;
};

function DayButton({
    day,
    current_day,
    selected_day,
    on_click,
}: DayButtonProps) {
    const [variant, set_variant] = useState("ghost");
    const [color_scheme, set_color_scheme] = useState("gray");

    useEffect(() => {
        if (selected_day === day) {
            set_variant("solid");
            set_color_scheme("purple");
        } else {
            set_variant("ghost");
            if (current_day === day) {
                set_color_scheme("green");
            } else {
                set_color_scheme("gray");
            }
        }
    }, [selected_day, current_day]);

    return (
        <Button
            size="sm"
            variant={variant}
            colorScheme={color_scheme}
            onClick={() => {
                on_click(day);
            }}
        >
            {week_day_string(day)}
        </Button>
    );
}
