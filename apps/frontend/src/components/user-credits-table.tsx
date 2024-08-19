import { useUserCredits } from '../hooks';
import { Table, TableCaption, TableCell, TableHeader, TableRow } from './ui';

export function UserCreditsTable() {
  const { data } = useUserCredits();

  return (
    <Table>
      <TableCaption>Available Credits</TableCaption>
      <thead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Credit</TableHeader>
        </TableRow>
      </thead>
      <tbody>
        {data?.map((credit) => (
          <TableRow key={credit.id}>
            <TableCell>{credit.actionName}</TableCell>
            <TableCell>{credit.amount}</TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}
