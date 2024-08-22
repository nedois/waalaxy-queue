import { ActionsHistoryTable } from './components/actions-history-table';
import { CreditActionButtonsGroup } from './components/credit-action-buttons-group';
import { LoggedUserInfo } from './components/logged-user-info';
import { LoginForm } from './components/login-form';
import { PageLoader } from './components/page-loader';
import { Flex } from './components/ui';
import { UserCreditsTable } from './components/user-credits-table';
import { UserQueue } from './components/user-queue';
import { AuthGuard, GuestGuard } from './guards';
import { useBootstrapApp } from './hooks';

export function App() {
  const loading = useBootstrapApp();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <Flex direction="column" center>
      <Flex direction="column" gap={8}>
        <AuthGuard>
          <LoggedUserInfo />
        </AuthGuard>

        <GuestGuard>
          <Flex center direction="column" mt={40}>
            <h3>Choose a user to login</h3>
            <LoginForm />
          </Flex>
        </GuestGuard>
      </Flex>

      <AuthGuard>
        <Flex direction="column">
          <CreditActionButtonsGroup />
          <UserQueue />
          <UserCreditsTable />
          <ActionsHistoryTable />
        </Flex>
      </AuthGuard>
    </Flex>
  );
}
