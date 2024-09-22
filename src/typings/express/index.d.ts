/* eslint-disable no-multi-spaces */
declare namespace Express {
  export interface Request {
    user: {
      id: string
      email: string
    },
    userBasic: {email: string, password: string};
  }
}
