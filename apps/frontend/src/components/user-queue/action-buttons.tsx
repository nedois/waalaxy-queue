import { useCredits, useAddAction } from '../../services';
import { Flex } from '../flex';
import { ActionButton } from './action-button';

interface ActionButtonsProps {
  userId: string;
}

export function ActionButtons({ userId }: ActionButtonsProps) {
  const { data: credits } = useCredits(userId);
  const { mutate: addAction, isLoading } = useAddAction(userId);

  return (
    <Flex gap={18} center>
      <ActionButton credit={credits?.['A'] ?? 0} onClick={() => addAction({ name: 'A' })} disabled={isLoading}>
        Action A
      </ActionButton>
      <ActionButton credit={credits?.['B'] ?? 0} onClick={() => addAction({ name: 'B' })} disabled={isLoading}>
        Action B
      </ActionButton>
      <ActionButton credit={credits?.['C'] ?? 0} onClick={() => addAction({ name: 'C' })} disabled={isLoading}>
        Action C
      </ActionButton>
    </Flex>
  );
}
