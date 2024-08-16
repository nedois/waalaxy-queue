import { ButtonLoader, ButtonRoot } from './button.styles';
import type { ButtonProps } from './button.types';

export function Button({ children, loading, ...props }: ButtonProps) {
  return (
    <ButtonRoot {...props}>
      {!loading && children}
      {loading && <ButtonLoader />}
    </ButtonRoot>
  );
}
