import { useCredits } from '../../services';
import { Flex } from '../flex';
import { ActionButton } from './action-button';

interface ActionButtonsProps {
  userId: string;
  onClick?: (action: string) => void;
}

export function ActionButtons({ userId, onClick }: ActionButtonsProps) {
  const { data: credits } = useCredits(userId);

  return (
    <Flex gap={18} center>
      <ActionButton credit={credits?.['A'] ?? 0} onClick={() => onClick?.('A')}>
        Action A
      </ActionButton>
      <ActionButton credit={credits?.['B'] ?? 0} onClick={() => onClick?.('B')}>
        Action B
      </ActionButton>
      <ActionButton credit={credits?.['C'] ?? 0} onClick={() => onClick?.('C')}>
        Action C
      </ActionButton>
    </Flex>
  );
}
