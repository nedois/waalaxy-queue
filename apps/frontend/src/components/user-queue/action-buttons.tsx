import { useCredits } from '../../services';
import { Flex } from '../flex';
import { ActionButton } from './action-button';

interface ActionButtonsProps {
  userId: string;
  onClick?: (action: string) => void;
  disabled?: boolean;
}

export function ActionButtons({ userId, onClick, disabled }: ActionButtonsProps) {
  const { data: credits } = useCredits(userId);

  return (
    <Flex gap={18} center>
      <ActionButton credit={credits?.['A'] ?? 0} onClick={() => onClick?.('A')} disabled={disabled}>
        Action A
      </ActionButton>
      <ActionButton credit={credits?.['B'] ?? 0} onClick={() => onClick?.('B')} disabled={disabled}>
        Action B
      </ActionButton>
      <ActionButton credit={credits?.['C'] ?? 0} onClick={() => onClick?.('C')} disabled={disabled}>
        Action C
      </ActionButton>
    </Flex>
  );
}
