import { CreateToastFnReturn } from "@chakra-ui/react";
import axios from "axios";

function get_error_description(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response)
      return `Unhandled server response (${error.response.status}), please contact me.`;
    else if (error.request)
      return `Couldn't get a response from the server, try again later.`;

    return `Failed to cr eate web request.`;
  }
  return `Failed to handle valid server response.`;
}

type SetLocation = (
  to: string,
  options?:
    | {
        replace?: boolean | undefined;
      }
    | undefined
) => void;

async function handle_401(
  setLocation: SetLocation,
  toast: CreateToastFnReturn
) {
  // make a log out request
  try {
    await axios.delete("/session");
  } catch (error) {
    console.error(error);
    toast({
      title: "Failed to clear expired session",
      description:
        "Something went wrong when trying to clear your expired session, try logging out or clearing your cookies.",
      status: "error",
      duration: 5000,
    });
    return;
  }

  // redirect to homepage
  setLocation("/");

  // create toast
  toast({
    title: "Your session has expired",
    description: "Your session has expired or your account no longer exists.",
    status: "info",
    duration: 5000,
  });
}

export { get_error_description, handle_401 };
