import { Icon, MenuItem, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useAtom } from "jotai";
import { IoIosLogOut } from "react-icons/io";
import { useLocation } from "wouter";
import { userAtom } from "../../../utils/state";

export default function LogoutButton() {
  const toast = useToast();
  const [, setLocation] = useLocation();
  const [, setUser] = useAtom(userAtom);

  const logout = async () => {
    const logoutRequest = axios.delete("/session");

    toast.promise(logoutRequest, {
      success: { title: "Logged out", duration: 2000 },
      error: {
        title: "Failed to log out",
        description: "Try reloading the page or clearing your cookies",
        duration: 5000,
      },
      loading: { title: "Logging out" },
    });

    try {
      await logoutRequest;
      setUser(null);
      setLocation("/");
    } catch (ex) {
      console.error(ex);
    }
  };

  return (
    <MenuItem
      onClick={logout}
      icon={<Icon boxSize={5} as={IoIosLogOut} />}
      color="red.300"
    >
      Logout
    </MenuItem>
  );
}
