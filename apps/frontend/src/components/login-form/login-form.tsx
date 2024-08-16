import { useState, type FormEvent } from 'react';
import { useLogin } from '../../hooks';
import { Button, Flex, Input } from '../ui';

export function LoginForm() {
  const { isLoading, mutate: login } = useLogin();
  const [username, setUsername] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login(username);
  };

  const handleUsernameChange = (event: FormEvent<HTMLInputElement>) => {
    setUsername(event.currentTarget.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex>
        <Input placeholder="Username" onChange={handleUsernameChange} required />
        <Button type="submit" loading={isLoading} disabled={isLoading}>
          Select User
        </Button>
      </Flex>
    </form>
  );
}
