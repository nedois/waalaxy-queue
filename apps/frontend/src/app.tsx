import { LoginForm } from './components/login-form';
import { Flex } from './components/ui';
import { UserCreditsTable } from './components/user-credits-table';

export function App() {
  return (
    <Flex direction="column" center>
      <Flex direction="column" gap={8}>
        <h3>Choose a user to login</h3>
        <LoginForm />
      </Flex>

      <UserCreditsTable />
    </Flex>
  );
}
