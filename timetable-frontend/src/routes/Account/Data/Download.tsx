import { Button, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { get_error_description, handle_401 } from "../../../utils/errors";
import { useLocation } from "wouter";

export default function Download() {
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const toast = useToast();

  const try_get_user_data = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/user_data", {
        validateStatus: (status) => status === 200 || status === 401,
      });

      if (response.status === 401) {
        handle_401(setLocation, toast);
        return;
      }

      const user_data: object = response.data;

      const blob = new Blob([JSON.stringify(user_data)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.download = "timetable_user_data.json";
      link.href = url;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      const toast_description = get_error_description(error);
      toast({
        title: "Failed to fetch user data",
        description: toast_description,
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Button
        onClick={try_get_user_data}
        isLoading={loading}
        colorScheme="purple"
      >
        Download your data
      </Button>
    </>
  );
}
