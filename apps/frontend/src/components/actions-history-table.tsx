import { useUserActions } from '../hooks';
import { formatActionStatus, formatDate } from '../utils';
import { Table, TableCaption, TableCell, TableHeader, TableRow } from './ui';

export function ActionsHistoryTable() {
  const { data } = useUserActions();

  return (
    <Table>
      <TableCaption>Actions history</TableCaption>
      <thead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Created at</TableHeader>
          <TableHeader>Runned at</TableHeader>
        </TableRow>
      </thead>
      <tbody>
        {data?.map((action) => (
          <TableRow key={action.id}>
            <TableCell>{action.name}</TableCell>
            <TableCell>{formatActionStatus(action.status)}</TableCell>
            <TableCell>{formatDate(action.createdAt)}</TableCell>
            <TableCell>{action.runnedAt ? formatDate(action.runnedAt) : '-'}</TableCell>
          </TableRow>
        ))}

        {!data?.length && (
          <TableRow>
            <TableCell colSpan={4}>No actions found</TableCell>
          </TableRow>
        )}
      </tbody>
    </Table>
  );
}
