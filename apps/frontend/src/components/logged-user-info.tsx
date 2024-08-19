import { useUserAccount } from '../hooks';

export function LoggedUserInfo() {
  const { data: user } = useUserAccount();

  if (!user) {
    return <p>Not logged in</p>;
  }

  return <p>Logged in as: {user.username}</p>;
}
