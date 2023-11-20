import { Card, CardBody } from "@chakra-ui/react";
import AccountCardLoaded from "./AccountCard/AccountCardLoaded";
import AccountCardSkeleton from "./AccountCard/AccountCardSkeleton";
import { useAtom } from "jotai";
import { userAtom } from "../../utils/state";

export default function AccountCard() {
  const [user] = useAtom(userAtom);

  return (
    <Card>
      <CardBody>
        {user == null ? (
          <AccountCardSkeleton />
        ) : (
          <AccountCardLoaded
            picture={user.picture}
            name={user.name}
            email={user.email}
          />
        )}
      </CardBody>
    </Card>
  );
}
