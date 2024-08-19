import { ActionsHistoryTable } from './components/actions-history-table';
import { CreditActionButtonsGroup } from './components/credit-action-buttons-group';
import { LoggedUserInfo } from './components/logged-user-info';
import { LoginForm } from './components/login-form';
import { PageLoader } from './components/page-loader';
import { Flex } from './components/ui';
import { UserCreditsTable } from './components/user-credits-table';
import { UserQueue } from './components/user-queue';
import { useAuth, useBootstrapApp } from './hooks';

export function App() {
  const { isAuthenticated } = useAuth();
  const loading = useBootstrapApp();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <Flex direction="column" center>
      <Flex direction="column" gap={8}>
        {isAuthenticated && <LoggedUserInfo />}

        {!isAuthenticated && (
          <Flex center direction="column" mt={40}>
            <h3>Choose a user to login</h3>
            <LoginForm />
          </Flex>
        )}
      </Flex>

      {isAuthenticated && (
        <Flex direction="column">
          <CreditActionButtonsGroup />
          <UserQueue />
          <UserCreditsTable />
          <ActionsHistoryTable />
        </Flex>
      )}
    </Flex>
  );
}
