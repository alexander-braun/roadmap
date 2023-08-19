const express = require("express");
require("../db/mongoose");
const { catchError, EMPTY, tap, from, switchMap, throwError } = require("rxjs");
const auth = require("../middleware/auth");
const Roadmap = require("../models/roadmap");

const router = express.Router();

router.post("/roadmaps", auth, (req, res) => {
  const roadmap = new Roadmap({
    ...req.body,
    owner: req.user._id,
  });

  from(roadmap.save())
    .pipe(
      catchError((e) => {
        res.status(400).send(e.message);
        return EMPTY;
      }),
      tap((roadmap) => {
        res.status(201).send(roadmap);
      })
    )
    .subscribe();
});

router.get("/roadmaps", auth, (req, res) => {
  from(Roadmap.find({ owner: req.user._id }))
    .pipe(
      catchError((e) => {
        res.status(500).send(e.message);
        return EMPTY;
      }),
      tap((roadmaps) => {
        if (!roadmaps) {
          res.status(400).send();
        }
        res.status(200).send(roadmaps);
      })
    )
    .subscribe();
});

router.get("/roadmaps/:id", auth, (req, res) => {
  from(Roadmap.findOne({ _id: req.params.id, owner: req.user._id }))
    .pipe(
      catchError((e) => {
        res.status(500).send(e.message);
        return EMPTY;
      }),
      tap((roadmap) => {
        if (!roadmap) {
          res.status(404).send();
        } else {
          res.status(200).send(roadmap);
        }
      })
    )
    .subscribe();
});

router.patch("/roadmaps/:id", auth, (req, res) => {
  from(Roadmap.findOne({ _id: req.params.id, owner: req.user._id }))
    .pipe(
      switchMap((roadmap) => {
        if (roadmap) {
          Object.keys(req.body).forEach(
            (key) => (roadmap[key] = req.body[key])
          );
          return from(roadmap.save());
        } else {
          return throwError(() => new Error("Roadmap not found"));
        }
      }),
      catchError((e) => {
        res.status(404).send(e.message);
        return EMPTY;
      }),
      tap((roadmap) => {
        if (!roadmap) {
          res.status(404).send();
        } else {
          res.status(200).send(roadmap);
        }
      })
    )
    .subscribe();
});

router.patch("/roadmaps/node/:id", auth, (req, res) => {
  from(
    Roadmap.findOneAndUpdate(
      { _id: req.params.id, "map.id": req.body.id },
      { $set: { "map.$": req.body } },
      { new: true }
    )
  )
    .pipe(
      catchError((e) => {
        res.status(404).send(e.message);
        return EMPTY;
      }),
      tap((roadmap) => {
        if (!roadmap) {
          res.status(404).send();
        } else {
          res
            .status(200)
            .send(roadmap.map.find((node) => node.id === req.body.id));
        }
      })
    )
    .subscribe();
});

router.delete("/roadmaps/node/:id", auth, (req, res) => {
  from(Roadmap.findOne({ _id: req.params.id }))
    .pipe(
      switchMap((roadmap) => {
        const node = roadmap.map.find((node) => node.id === req.body.id);
        const subChildren = node.children.map(
          (child) => roadmap.map.find((node) => node.id === child).children
        );
        const children = [...node.children, ...subChildren.flat(), req.body.id];

        return from(
          Roadmap.findByIdAndUpdate(
            { _id: req.params.id },
            { $pull: { map: { id: children } } },
            { new: true, useFindAndModify: false }
          )
        );
      }),
      tap((roadmap) => {
        if (!roadmap) {
          res.status(404).send();
        } else {
          res.status(200).send(roadmap.map);
        }
      }),
      catchError((e) => {
        res.status(404).send(e.message);
        return EMPTY;
      })
    )
    .subscribe();
});

router.post("/roadmaps/node/:id", auth, (req, res) => {
  from(
    Roadmap.findOneAndUpdate(
      { _id: req.params.id, "map.id": { $ne: req.body.id } },
      {
        $push: {
          map: req.body,
        },
      },
      { new: true, useFindAndModify: false }
    )
  )
    .pipe(
      catchError((e) => {
        res.status(500).send(e.message);
        return EMPTY;
      }),
      tap((roadmap) => {
        if (!roadmap) {
          res.status(404).send("Roadmap not found or not a unique id");
        } else {
          res.status(200).send(roadmap.map);
        }
      })
    )
    .subscribe();
});

router.delete("/roadmaps/:id", auth, (req, res) => {
  from(Roadmap.findOneAndDelete({ _id: req.params.id }))
    .pipe(
      catchError((e) => {
        res.status(500).send(e.message);
        return EMPTY;
      }),
      tap((roadmap) => {
        if (!roadmap) {
          res.status(404).send();
        } else {
          res.status(200).send(roadmap);
        }
      })
    )
    .subscribe();
});

module.exports = router;
