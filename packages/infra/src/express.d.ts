declare namespace Express {
  interface User {
    id: string;
    username: string;
  }

  export interface Request {
    user: User;
  }
}
