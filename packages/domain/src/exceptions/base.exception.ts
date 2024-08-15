export abstract class BaseException extends Error {
  declare abstract code: string;

  declare statusCode?: number;

  constructor(message: string) {
    super(message);
  }
}
