import styled from 'styled-components';

export const Table = styled.table`
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid ${({ theme }) => theme.colors.primary.main};
  border-radius: ${({ theme }) => theme.radius.sm};
  overflow: hidden;
`;

export const TableRow = styled.tr``;

export const TableHeader = styled.th`
  padding: ${({ theme }) => theme.spacing.sm};
  font-weight: bold;
  text-align: center;
  border-left: 1px solid ${({ theme }) => theme.colors.primary.main};

  &:first-child {
    border-left: none;
  }
`;

export const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.sm};
  text-align: center;
  border-top: 1px solid ${({ theme }) => theme.colors.primary.main};
  border-left: 1px solid ${({ theme }) => theme.colors.primary.main};

  &:first-child {
    border-left: none;
  }
`;

export const TableCaption = styled.caption`
  font-weight: bold;
  text-wrap: nowrap;
  color: ${({ theme }) => theme.colors.primary.main};
  padding: ${({ theme }) => theme.spacing.sm};
`;
