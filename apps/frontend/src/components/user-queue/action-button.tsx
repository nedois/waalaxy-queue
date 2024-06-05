import styled from 'styled-components';

import { Button, ButtonProps } from '../button';
import { Flex } from '../flex';

const Credit = styled.span`
  font-size: 14px;
`;

interface ActionButtonProps extends ButtonProps {
  credit: number;
}

export function ActionButton({ children, credit, ...props }: ActionButtonProps) {
  return (
    <Flex direction="column" center>
      <Button {...props}>{children}</Button>
      <Credit>Crédits: {credit}</Credit>
    </Flex>
  );
}
