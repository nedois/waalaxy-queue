import styled from 'styled-components';

import { useCountdown } from '../../hooks/use-countdown';
import { Timer } from './timer';
import { Flex } from '../flex';
import { ActionButtons } from './action-buttons';
import { QueueContent } from './queue-content';
import { useSubscribeToActions } from '../../services';

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.colors.background.main};
  border: ${({ theme }) => `1px solid ${theme.colors.background.darker}`};
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  max-width: 480px;
  width: 100%;
`;

const User = styled.span`
  font-size: 24px;
  font-weight: bold;
`;

interface UserQueueProps {
  userId: string;
}

export function UserQueue({ userId }: UserQueueProps) {
  const { remainingTime, resetCountdown } = useCountdown({ startTime: 14, status: 'running' });

  useSubscribeToActions(userId, {
    onRunningAction: resetCountdown,
  });

  return (
    <Root>
      <Flex grow>
        <User>{userId}</User>
        <Timer time={remainingTime} />
      </Flex>

      <ActionButtons userId={userId} />

      <QueueContent userId={userId} />
    </Root>
  );
}
