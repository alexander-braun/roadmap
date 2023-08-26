import express, { Express, Request, Response } from "express";
require("../db/mongoose");
import User from "../models/user";
import { catchError, EMPTY, tap, from, switchMap, of } from "rxjs";
import { auth } from "../middleware/auth";
import IUser from "../models/user.model";
const sendMail = require("../emails/account");

const router = express.Router();

router.post("/users", (req, res) => {
  const user = new User(req.body);
  from(user.save())
    .pipe(
      switchMap((user: IUser) =>
        user
          .generateAuthToken()
          .pipe(switchMap((token) => of<[IUser, string]>([user, token])))
      ),
      catchError((e) => {
        res.status(400).send(e.message);
        return EMPTY;
      }),
      tap(([user, token]) => {
        const tokenVals = JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString()
        );
        res.status(201).send({ user, token, expiresAt: tokenVals.exp });
        /*
            res.cookie('name', 'geeksforgeeks');
            res.send("Cookie Set");
        */
        /*
        sendMail(
          user.email,
          "Thanks for signing up!",
          `Welcome to roadmap ${user.email}. I hope you enjoy!`
        );
        */
      })
    )
    .subscribe();
});

router.post("/users/login", (req, res) => {
  User.findByCredentials(req.body.email, req.body.password)
    .pipe(
      switchMap((user) =>
        user
          .generateAuthToken()
          .pipe(switchMap((token) => of<[IUser, string]>([user, token])))
      ),
      catchError((e) => {
        res.status(400).send(e.message);

        return EMPTY;
      }),
      tap(([user, token]) => {
        const tokenVals = JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString()
        );
        res.status(200).send({ user, token, expiresAt: tokenVals.exp });
      })
    )
    .subscribe();
});

router.post("/users/logout", auth, (req, res) => {
  req.user.tokens = (req.user as IUser).tokens.filter(
    (tokenObj) => tokenObj.token !== req.token
  );
  from(req.user.save())
    .pipe(
      catchError((e) => {
        res.status(500).send(e.message);
        return EMPTY;
      }),
      tap((user) => {
        if (!user) {
          res.status(400).send();
        }
        res.status(200).send(user);
      })
    )
    .subscribe();
});

router.post("/users/logoutAll", auth, (req, res) => {
  req.user.tokens = [];
  from(req.user.save())
    .pipe(
      catchError((e) => {
        res.status(500).send(e.message);
        return EMPTY;
      }),
      tap((user) => {
        if (!user) {
          res.status(500).send();
        }
        res.status(200).send(user);
      })
    )
    .subscribe();
});

router.get("/users/me", auth, (req, res) => {
  // user is added to request in auth middleware
  res.send(req.user);
});

router.patch("/users/me", auth, (req, res) => {
  const changedFields = Object.keys(req.body);
  const allowedOperations = ["email", "password"];
  const isValidOperation = changedFields.every((field) =>
    allowedOperations.includes(field)
  );

  if (!isValidOperation) {
    res.status(400).send({ message: "Invalid updates!" });
    return;
  }

  changedFields.forEach((field) => {
    req.user[field] = req.body[field];
  });
  from(req.user.save())
    .pipe(
      catchError((e) => {
        res.status(500).send(e.message);
        return EMPTY;
      }),
      tap((user) => {
        if (!user) {
          res.status(404).send();
        } else {
          res.status(200).send(user);
        }
      })
    )
    .subscribe();
});

router.delete("/users/me", auth, (req, res) => {
  from(req.user.deleteOne())
    .pipe(
      catchError((e) => {
        res.status(500).send(e.message);
        return EMPTY;
      }),
      tap((user) => {
        if (!user) {
          res.status(500).send();
        } else {
          res.status(200).send(user);
          /*
          sendMail(
            user.email,
            "Your account has been removed.",
            `Good Bye ${user.email} and thank you for using roadmap!`
          );
          */
        }
      })
    )
    .subscribe();
});

export default router;
