import { Box, VStack, useToast } from "@chakra-ui/react";
import Landing from "./routes/Landing";
import Footer from "./components/Footer";
import Home from "./routes/Home";
import { Route, Switch, Redirect, useLocation } from "wouter";
import Account from "./routes/Account";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { userAtom } from "./utils/state";
import axios from "axios";
import { User } from "./utils/types";
import { get_error_description } from "./utils/errors";
import customParseFormat from "dayjs/plugin/customParseFormat";
import dayjs from "dayjs";

dayjs.extend(customParseFormat);
axios.defaults.baseURL = import.meta.env.DEV
    ? "http://localhost:8080"
    : undefined;
axios.defaults.withCredentials = import.meta.env.DEV ? true : false;

function App() {
    const [user, setUser] = useAtom(userAtom);
    const [location, setLocation] = useLocation();
    const toast = useToast();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load_session = async () => {
            setLoading(true);

            try {
                const response = await axios.get<User>("/session", {
                    validateStatus: (status) =>
                        status === 200 || status === 401,
                });

                if (response.status == 200) {
                    setUser(response.data);
                }
                setLoading(false);
            } catch (error) {
                console.error(error);
                const toast_description = get_error_description(error);
                toast({
                    title: "Failed to fetch session",
                    description: toast_description,
                    status: "error",
                    duration: null,
                });
            }
        };

        load_session();
    }, [setUser, toast]);

    useEffect(() => {
        if (loading) {
            return;
        }
        if (user == null && location != "/") {
            setLocation("/", { replace: true });
        } else if (user != null && location == "/") {
            setLocation("/home", { replace: true });
        }
    }, [location, user, setLocation, loading]);

    return (
        <VStack gap={0} h="100vh" w="100vw" overflowY="auto">
            <Box pb={2} /* h="calc(100% - 60px)" */ h="100%" w="100%">
                {loading ? null : (
                    <Switch>
                        <Route path="/" component={Landing} />
                        <Route path="/home" component={Home} />
                        <Route path="/account" component={Account} />
                        <Route>
                            <Redirect to="/" />
                        </Route>
                    </Switch>
                )}
            </Box>
            {/* <Footer /> */}
        </VStack>
    );
}

export default App;
