import { FlexRoot } from './flex.styles';
import type { FlexProps } from './flex.types';

export function Flex({ children, gap = 12, direction = 'row', ...props }: FlexProps) {
  return (
    <FlexRoot gap={gap} direction={direction} {...props}>
      {children}
    </FlexRoot>
  );
}
