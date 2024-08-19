import { useCreateUserAction } from '../../hooks';
import { Button } from '../ui';
import type { CreateActionButtonProps } from './create-action-button.types';

export function CreateActionButton({ actionName, disabled, ...props }: CreateActionButtonProps) {
  const { isLoading, mutate: createAction } = useCreateUserAction();

  const handleCreateAction = () => {
    createAction(actionName);
  };

  return (
    <Button onClick={handleCreateAction} disabled={disabled || isLoading} loading={isLoading} {...props}>
      Create action {actionName}
    </Button>
  );
}
