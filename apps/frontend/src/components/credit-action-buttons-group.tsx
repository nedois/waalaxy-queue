import { CreateActionButton } from './create-action-button';
import { Flex } from './ui';

export function CreditActionButtonsGroup() {
  return (
    <Flex>
      <CreateActionButton actionName="A" />
      <CreateActionButton actionName="B" />
      <CreateActionButton actionName="C" />
    </Flex>
  );
}
