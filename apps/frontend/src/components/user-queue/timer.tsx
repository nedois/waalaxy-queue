import styled from 'styled-components';

import clockIconUrl from '../../assets/clock-icon.svg';

const Root = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;

  img {
    width: 24px;
    height: 24px;
  }

  span {
    font-size: 14px;
  }
`;

interface TimerProps {
  time: number;
}

export function Timer({ time }: TimerProps) {
  return (
    <Root>
      <img src={clockIconUrl} alt="Horloge" />
      <span>
        Prochaine action dans : <b>{time} s</b>
      </span>
    </Root>
  );
}
