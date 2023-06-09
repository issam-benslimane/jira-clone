import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginStrategy, TLogin, TRegister } from "./types";
import { BadRequestError, UnauthorizedError } from "../common/utils";
import { env } from "../../config";
import { usersService } from "../users/service";
import { User } from "@prisma/client";

const jwtSecret = env.jwt.secret;

const login = (strategy: string, credentials?: TLogin) => {
  if (!isValidStrategy(strategy))
    throw new BadRequestError("Please provide a valid strategy!");
  if (strategy === LoginStrategy.CREDENTIALS) {
    if (!credentials) throw new BadRequestError("Credentials required!");
    return loginWithCredentials(credentials);
  }
  return loginAsGuest();
};

const signup = async (data: TRegister) => {
  const { name, email, password } = data;
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const user = await usersService.createUser({ name, email, passwordHash });
  return { token: jwt.sign(user.email, jwtSecret), user };
};

const loginAsGuest = async () => {
  const guestUser = (await usersService.getUser({
    email: "rick@jira.guest",
  })) as User;
  return {
    token: jwt.sign(guestUser.email, jwtSecret),
    user: guestUser,
  };
};

const loginWithCredentials = async (credentials: TLogin) => {
  const { email, password } = credentials;
  const user = await usersService.getUser({ email });
  const areValidCredentials =
    user && (await bcrypt.compare(password, user.passwordHash));
  if (!areValidCredentials)
    throw new UnauthorizedError("username or password incorrect");
  return { token: jwt.sign(user.email, jwtSecret), user };
};

const authenticateToken = async (token: string) => {
  const email = jwt.verify(token, jwtSecret) as string;
  const user = await usersService.getUser({ email });
  if (user == null) throw new UnauthorizedError("User does not exist!");
  return user;
};

const isValidStrategy = (strategy: string): strategy is LoginStrategy => {
  return strategy.toUpperCase() in LoginStrategy;
};

export const authService = { login, signup, authenticateToken };
