const express = require("express");
require("../db/mongoose");
const CardDataDefault = require("../models/card-data-default");
const { catchError, EMPTY, tap, from, switchMap, of } = require("rxjs");

const router = express.Router();

// No auth so every user/non-user can fetch the default data
// TODO: Make it possible for only ADMIN to update data here

router.post("/default-card-data", (req, res) => {
  const cardDataDefault = new CardDataDefault(req.body);

  from(cardDataDefault.save())
    .pipe(
      catchError((e) => {
        res.status(400).send(e.message);
        return EMPTY;
      }),
      tap((cardData) => {
        res.status(201).send(cardData);
      })
    )
    .subscribe();
});

router.patch("/default-card-data", (req, res) => {
  from(CardDataDefault.findOne({ defaultMap: true }))
    .pipe(
      switchMap((card) => {
        card.cards = req.body.cards;
        return from(card.save());
      }),
      catchError((e) => {
        res.status(400).send(e.message);
        return EMPTY;
      }),
      tap((nodes) => {
        res.status(201).send(nodes);
      })
    )
    .subscribe();
});

router.get("/default-card-data", (req, res) => {
  from(CardDataDefault.find({ defaultMap: true }))
    .pipe(
      catchError((e) => {
        res.status(500).send(e.message);
        return EMPTY;
      }),
      tap((cards) => {
        if (!cards) {
          res.status(400).send();
        }
        res.status(200).send(cards);
      })
    )
    .subscribe();
});

module.exports = router;
