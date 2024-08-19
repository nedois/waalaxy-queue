import { ActionsHistoryTable } from './components/actions-history-table';
import { CreateActionButton } from './components/create-action-button';
import { LoggedUserInfo } from './components/logged-user-info';
import { LoginForm } from './components/login-form';
import { PageLoader } from './components/page-loader';
import { Flex } from './components/ui';
import { UserCreditsTable } from './components/user-credits-table';
import { UserQueue } from './components/user-queue';
import { useBootstrapApp } from './hooks';

export function App() {
  const loading = useBootstrapApp();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <Flex direction="column" center>
      <Flex direction="column" gap={8}>
        <h3>Choose a user to login</h3>
        <LoginForm />
        <LoggedUserInfo />
      </Flex>

      <Flex>
        <CreateActionButton actionName="A" />
        <CreateActionButton actionName="B" />
        <CreateActionButton actionName="C" />
      </Flex>

      <UserQueue />
      <UserCreditsTable />
      <ActionsHistoryTable />
    </Flex>
  );
}
