import { forwardRef } from 'react';
import { Flex } from '../ui';
import { CountdownCounterRoot } from './countdown-counter.styles';
import type { CountdownCounterProps } from './countdown-counter.types';

export const CountdownCounter = forwardRef<HTMLSpanElement, CountdownCounterProps>(({ message, icon }, ref) => (
  <CountdownCounterRoot>
    {icon}
    <Flex center gap={4}>
      <span>{message}</span>
      <b>
        <span ref={ref} />
      </b>
    </Flex>
  </CountdownCounterRoot>
));
