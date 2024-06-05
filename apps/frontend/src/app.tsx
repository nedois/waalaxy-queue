import { Flex } from './components/flex';
import { ResetDatabaseButton } from './components/reset-database-button';
import { UserQueue } from './components/user-queue';

export function App() {
  return (
    <Flex direction="column" center gap={18} mt={32}>
      <UserQueue userId="John" />
      <UserQueue userId="Ana" />
      <UserQueue userId="Pedro" />
      <ResetDatabaseButton />
    </Flex>
  );
}
