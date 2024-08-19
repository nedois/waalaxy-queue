import { useLogout, useUserAccount } from '../hooks';
import { Button, Flex } from './ui';

export function LoggedUserInfo() {
  const { data: user } = useUserAccount();
  const { mutate: logout, isLoading } = useLogout();

  if (!user) {
    return null;
  }

  return (
    <Flex center>
      <p>Logged in as: {user.username}</p>
      <Button onClick={() => logout()} disabled={isLoading} loading={isLoading}>
        Logout
      </Button>
    </Flex>
  );
}
