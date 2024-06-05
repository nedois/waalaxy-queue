import type { ReactNode } from 'react';
import styled from 'styled-components';

interface FlexProps {
  children: ReactNode;
  gap?: number;
  direction?: 'row' | 'column';
  grow?: boolean;
  center?: boolean;
  wrap?: boolean;
  mt?: number;
}

const Root = styled.div<FlexProps>`
  display: flex;
  gap: ${(props) => props.gap ?? 0}px;
  flex-direction: ${(props) => props.direction ?? 'row'};
  justify-content: ${(props) => props.grow && 'space-between'};
  align-items: ${(props) => props.center && 'center'};
  flex-wrap: ${(props) => props.wrap && 'wrap'};
  margin-top: ${(props) => props.mt && `${props.mt}px`};
`;

export function Flex({ children, gap = 12, direction = 'row', ...props }: FlexProps) {
  return (
    <Root gap={gap} direction={direction} {...props}>
      {children}
    </Root>
  );
}
