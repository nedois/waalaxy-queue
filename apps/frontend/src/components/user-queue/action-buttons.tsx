import { useAddAction, useCredits } from '../../api';
import { Flex } from '../flex';
import { ActionButton } from './action-button';

interface ActionButtonsProps {
  userId: string;
  onClick?: (actionName: ActionName) => void;
}

export function ActionButtons({ userId, onClick }: ActionButtonsProps) {
  const { data: credits } = useCredits(userId);
  const { mutate: addAction, isLoading } = useAddAction(userId);

  const handleActionClick = (actionName: ActionName) => {
    addAction({ name: actionName });
    onClick?.(actionName);
  };

  return (
    <Flex gap={18} center>
      <ActionButton credit={credits?.['A'] ?? 0} onClick={() => handleActionClick('A')} disabled={isLoading}>
        Action A
      </ActionButton>
      <ActionButton credit={credits?.['B'] ?? 0} onClick={() => handleActionClick('B')} disabled={isLoading}>
        Action B
      </ActionButton>
      <ActionButton credit={credits?.['C'] ?? 0} onClick={() => handleActionClick('C')} disabled={isLoading}>
        Action C
      </ActionButton>
    </Flex>
  );
}
