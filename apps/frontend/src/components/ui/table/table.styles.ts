import styled from 'styled-components';

export const Table = styled.table`
  border-collapse: collapse;
`;

export const TableRow = styled.tr`
  border: 1px solid ${({ theme }) => theme.colors.primary.main};
  border-radius: ${({ theme }) => theme.radius.md};
`;

export const TableHeader = styled.th`
  padding: ${({ theme }) => theme.spacing.sm};
  font-weight: bold;
`;

export const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.sm};
  text-align: center;
`;

export const TableCaption = styled.caption`
  font-weight: bold;
  text-wrap: nowrap;
  color: ${({ theme }) => theme.colors.primary.main};
  padding: ${({ theme }) => theme.spacing.sm};
`;