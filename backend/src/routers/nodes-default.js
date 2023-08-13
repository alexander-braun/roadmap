const express = require("express");
require("../db/mongoose");
const NodesDefault = require("../models/nodes-default");
const { catchError, EMPTY, tap, from, switchMap, of } = require("rxjs");

const router = express.Router();

// No auth so every user/non-user can fetch the default data
// TODO: Make it possible for only ADMIN to update data here

router.post("/default-nodes", (req, res) => {
  const nodesDefault = new NodesDefault(req.body);

  from(nodesDefault.save())
    .pipe(
      catchError((e) => {
        res.status(400).send(e.message);
        return EMPTY;
      }),
      tap((task) => {
        res.status(201).send(task);
      })
    )
    .subscribe();
});

router.patch("/default-nodes", (req, res) => {
  from(NodesDefault.findOne({ defaultMap: true }))
    .pipe(
      switchMap((node) => {
        node.nodes = req.body.nodes;
        return from(node.save());
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

router.get("/default-nodes", (req, res) => {
  from(NodesDefault.find({ defaultMap: true }))
    .pipe(
      catchError((e) => {
        res.status(500).send(e.message);
        return EMPTY;
      }),
      tap((nodes) => {
        if (!nodes) {
          res.status(400).send();
        }
        res.status(200).send(nodes);
      })
    )
    .subscribe();
});

module.exports = router;
