import styled from 'styled-components';
import type { FlexProps } from './flex.types';

export const FlexRoot = styled.div<FlexProps>`
  display: flex;
  gap: ${(props) => props.gap ?? 0}px;
  flex-direction: ${(props) => props.direction ?? 'row'};
  justify-content: ${(props) => props.grow && 'space-between'};
  align-items: ${(props) => props.center && 'center'};
  flex-wrap: ${(props) => props.wrap && 'wrap'};
  margin-top: ${(props) => props.mt && `${props.mt}px`};
`;
