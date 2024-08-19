import type { Action } from '../../api';
import type { ButtonProps } from '../ui';

export interface CreateActionButtonProps extends Omit<ButtonProps, 'children' | 'onClick' | 'loading'> {
  actionName: Action['name'];
}
