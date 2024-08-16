import { useUserCredits } from '../hooks';
import { Table, TableCaption, TableCell, TableHeader, TableRow } from './table/table.styles';

export function UserCreditsTable() {
  const { data } = useUserCredits();

  return (
    <Table>
      <TableCaption>Available Credits</TableCaption>
      <TableRow>
        <TableHeader>Name</TableHeader>
        <TableHeader>Credit</TableHeader>
      </TableRow>
      {data?.map((credit) => (
        <TableRow key={credit.id}>
          <TableCell>{credit.actionName}</TableCell>
          <TableCell>{credit.amount}</TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
