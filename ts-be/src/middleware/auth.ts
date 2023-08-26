import jwt from "jsonwebtoken";
import User from "../models/user";
import { switchMap, catchError, EMPTY, tap, of, from } from "rxjs";
import express, { Express, NextFunction, Request, Response } from "express";
import IUser from "../models/user.model";

export interface JwtPayload {
  _id: string;
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  try {
    of(jwt.verify(token || "", process.env.JWT_SECRET || "") as JwtPayload)
      .pipe(
        switchMap((decoded) =>
          User.findOne({ _id: decoded._id, "tokens.token": token })
        ),
        catchError((e) => {
          res.status(401).send(e.message);
          return EMPTY;
        }),
        tap((user) => {
          if (!user) {
            res.status(401).send("Please authenticate");
          } else {
            const tokenVals = JSON.parse(
              Buffer.from(token?.split(".")?.[1] || "", "base64").toString()
            );
            req.token = token;
            req.user = user;
            req.expiresAt = tokenVals;
            next();
          }
        })
      )
      .subscribe();
  } catch (e) {
    return res.status(401).send();
  }
};
