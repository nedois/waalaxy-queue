import { useResetDatabase } from '../services';
import { Button } from './button';

export function ResetDatabaseButton() {
  const { mutate: reset, isLoading } = useResetDatabase();

  return (
    <Button onClick={() => reset()} disabled={isLoading}>
      Reset database
    </Button>
  );
}
