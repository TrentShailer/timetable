import { Menu, MenuItem, MenuList, Icon, Divider } from "@chakra-ui/react";
import { IoSettingsOutline, IoHomeOutline } from "react-icons/io5";
import LogoutButton from "./AccountMenu/LogoutButton";
import { useLocation } from "wouter";
import AccountMenuButton from "./AccountMenu/AccountMenuButton";

export default function AccountMenu() {
  const [, setLocation] = useLocation();

  return (
    <Menu>
      <AccountMenuButton />
      <MenuList>
        <MenuItem
          onClick={() => setLocation("/home")}
          icon={<Icon boxSize={5} as={IoHomeOutline} />}
        >
          Home
        </MenuItem>
        <MenuItem
          onClick={() => setLocation("/account")}
          icon={<Icon boxSize={5} as={IoSettingsOutline} />}
        >
          Manage Account
        </MenuItem>
        <Divider />
        <LogoutButton />
      </MenuList>
    </Menu>
  );
}
