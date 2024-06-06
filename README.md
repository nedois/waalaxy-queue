# Waalaxy Queue

This is a simple FIFO queue system implementation were users can add actions into a queue that are executed every 15s based on the order they were added and the avaible action credits.

## Requirements

- [x] User can add an action to the queue
- [x] User can see the queue
- [x] Recalculate action credits every 10 minutes
- [x] Execute actions every 15s
- [x] Add start commands: `nx start frontend` and `nx start backend`
- [x] Write some backend tests
- [x] Skip action if user has not enough credits to execute it
- [x] Scale horizontally the worker

## Get started

1. Install dependencies

```bash
npm install
```

2. Set environment variables

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

3. Mount redis service (optional)

```bash
nx docker-up backend
```

4. Start the backend and frontend

```bash
nx start backend
nx start frontend
```
