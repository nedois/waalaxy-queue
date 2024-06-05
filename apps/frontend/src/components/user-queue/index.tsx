import { useState } from 'react';
import styled from 'styled-components';

import { useCountdown } from '../../hooks/use-countdown';
import { Timer } from './timer';
import { Flex } from '../flex';
import { QueueAction, Queue } from './queue';
import { ActionButtons } from './action-buttons';

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
  const [pendingActions, setPendingActions] = useState<string[]>([]);
  const [finishedActions] = useState<string[]>([]);
  const { remainingTime, startCountdown } = useCountdown({ startTime: 5 });

  const handleAddAction = (action: string) => {
    setPendingActions((prevPendingActions) => [...prevPendingActions, action]);

    if (pendingActions.length === 0) {
      startCountdown();
    }
  };

  return (
    <Root>
      <Flex grow>
        <User>{userId}</User>
        <Timer time={remainingTime} />
      </Flex>

      <ActionButtons userId={userId} onClick={handleAddAction} />

      <Queue status="pending">
        {pendingActions.map((action, index) => (
          <QueueAction active={index === 0} key={index}>
            {action}
          </QueueAction>
        ))}
      </Queue>

      <Queue status="finished">
        {finishedActions.map((action, index) => (
          <QueueAction key={index}>{action}</QueueAction>
        ))}
      </Queue>
    </Root>
  );
}
