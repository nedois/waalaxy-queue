# Waalaxy Queue

This project implements a simple FIFO (First-In-First-Out) queue system where users can add actions to a queue, which are then executed in order every 15 seconds based on the available action credits.

## Features

- **Add Actions**: Users can add multiple actions to the queue.
- **Actions execution**: 3 fake actions `A`, `B`, and `C` are implemented. Each action takes a different amount of time to finish.
- **View Queue**: Users can view the current state of the queue.
- **Credits Management**: Action credits are recalculated every 10 minutes, ensuring that the user always has up-to-date credit information.
- **Credit Check**: If a user does not have enough credits to execute an action, that action will be skipped.
- **Execute Actions**: Actions in the queue are executed every 15 seconds.
- **Queue Management**: Each user have their own independent queue.
- **Queue Processing**: The queue is processed using Nodejs timers and only one timer is active for each user.
- **Start Commands**: Easily start both the frontend and backend using `nx start frontend` and `nx start backend`.
- **Backend Tests**: Backend tests are included to ensure the reliability of the system.
- **Global error handling**: Errors are handled globally using an error middleware.
- **Authentication**: A fake authentication mechanism is implemented to simulate user authentication using the `user id` as the authentication token.
- **Realtime updates**: Realtime updates are implemented using server sent events (SSE). Each notification received invalidate the in-memory user cache from `@tanstack/react-query` and new data is refetched.
- **Redis Support**: The system supports both in-memory and redis database for storing user data.
- **Graceful Shutdown**: The system gracefully shuts down when the server is stopped, preventing running actions from being interrupted.
- **Dependency Injection**: The system uses a simple object as a container for dependency injection.
- **Env variables**: Environment variables are verified and used to configure the system.

## Get started

### Prequisites

- Ensure you have Node.js >= v20.16.0 installed.
- Ensure you have Docker installed (optional) for running the Redis service.

### Installation

1. Clone the repository:

```bash
git clone https://github.com/nedois/waalaxy-queue.git
cd waalaxy-queue
```

2. Install dependencies

```bash
npm install
```

3. Set environment variables

Copy the example environment files and modify them as necessary.

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

4. Setup redis database (optional)

Redis is required if you need to persist the users data.

Change the `DB_TYPE` in the `apps/backend/.env` file to `redis` and start redis container using:

```bash
nx docker-up backend
```

### Running the application

Start the backend and frontend using:

```bash
nx start backend
nx start frontend
```

## Usage

### Authentication

- **Login**: Use a random username to log in to the system. All username are case sensitive.

### Queue Management

- **Adding actions**: Use the action buttons in the main page to add actions to the queue.
- **Viewing queue**: The user queue is displayed on the main page.

## Testing

- Backend tests are included and can be run with:

```bash
nx test backend
```

### Architecture

The project is structured as a monorepo using Nx. The backend is an express server and the frontend is a React application. The project was structured following a clean architecture pattern. Files are grouped by type and not by feature nor layer. For example: all repositories are grouped together, all services are grouped together, etc.
and not grouped in a port folder.

- `packages/domain`: the core business logic is implemented inside this package, and completely decoupled from the infrastructure.
- `packages/infra`: all ports are implemented in this package.

Separating the infra from the domain in packages allows us to use the Nx boundary feature to enforce the dependency rule. The domain package should not depend on the infra package.

### Future Improvements

- Implement a real authentication mechanism.
- Consider implementing a worker based system for processing the queue to handle large number of users.
- Implement or use a better DI management system like Inversify.
