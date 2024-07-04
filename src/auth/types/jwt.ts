export type JWTPayload = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
};

export type JWTTokens = {
  accessToken: string;
  refreshToken: string;
};
