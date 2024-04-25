import express from "express";
require("../db/mongoose");
import { catchError, EMPTY, tap, from, switchMap, throwError } from "rxjs";
import { auth } from "../middleware/auth";
import { RoadmapModel, IRoadmap } from "../models/roadmap";
import { defaultRoadmap } from "../data/default-roadmap";
import { v4 as uuid } from "uuid";
import mongoose from "mongoose";

const router = express.Router();

// Not used
router.post("/", auth, (req, res) => {
  const roadmap = new RoadmapModel({
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

// Add default Frontend Roadmap
router.post("/default-frontend", auth, (req, res) => {
  const roadmap = new RoadmapModel({
    ...defaultRoadmap,
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

// Add new default Roadmap
router.post("/default", auth, (req, res) => {
  createDefaultMap(
    req.user._id,
    req.body.newDefault,
    req.body.title,
    req.body.subtitle
  ).subscribe({
    next: (roadmap) => {
      res.status(201).send(roadmap);
    },
    error: (err) => {
      res
        .status(401)
        .send({ message: "Something went wrong", error: err.message });
    },
  });
});

// Get General version of default roadmap
router.get("/default-frontend", (req, res) => {
  res.status(200).send(defaultRoadmap);
});

// Get all of users Roadmaps
router.get("/", auth, (req, res) => {
  from(RoadmapModel.find({ owner: req.user._id }))
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

        // try to issue new token right here
        // either send it back or set as cookie (prefered)
      })
    )
    .subscribe();
});

// Get roadmap by ID
router.get("/:id", auth, (req, res) => {
  from(RoadmapModel.findOne({ _id: req.params.id, owner: req.user._id }))
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

// Patch whole map
router.patch("/:id", auth, (req, res) => {
  from(RoadmapModel.findOne({ _id: req.params.id, owner: req.user._id }))
    .pipe(
      switchMap((roadmap) => {
        if (roadmap) {
          (Object.keys(req.body) as Array<keyof IRoadmap>).forEach((key) => {
            roadmap[key] = req.body[key];
          });
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

// Post Settings
router.post("/settings/:mapId", auth, (req, res) => {
  from(RoadmapModel.findOne({ _id: req.params.mapId, owner: req.user._id }))
    .pipe(
      switchMap((roadmap) => {
        if (roadmap) {
          roadmap.settings = req.body;
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

// Patch one Node
router.patch("/:mapId/mapnode/:nodeId", auth, (req, res) => {
  from(
    RoadmapModel.findOneAndUpdate(
      { _id: req.params.mapId, owner: req.user._id },
      {
        $set: {
          ...(req.body.title && { "map.$[element].title": req.body.title }),
          ...(req.body.mainKnot && {
            "map.$[element].mainKnot": req.body.mainKnot,
          }),
          ...(req.body.children && {
            "map.$[element].children": req.body.children,
          }),
          ...(req.body.id && { "map.$[element].id": req.body.id }),
          ...(req.body.notes && { "map.$[element].notes": req.body.notes }),
          ...(req.body.categoryId && {
            "map.$[element].categoryId": req.body.categoryId,
          }),
          ...(req.body.status && { "map.$[element].status": req.body.status }),
        },
      },
      {
        arrayFilters: [{ "element.id": req.params.nodeId }],
        new: true,
      }
    )
  ).subscribe({
    next: (map) => {
      res.status(201).send(map);
    },
    error: (err) => {
      res.status(401).send(err);
    },
  });
});

// Not used patch node by ID
router.patch("/node/:id", auth, (req, res) => {
  from(
    RoadmapModel.findOneAndUpdate(
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

// Not used delete node by ID
router.delete("/node/:id", auth, (req, res) => {
  from(RoadmapModel.findOne({ _id: req.params.id }))
    .pipe(
      switchMap((roadmap) => {
        const node = roadmap?.map.find((node) => node.id === req.body.id);
        const subChildren = node?.children
          .map(
            (child) => roadmap?.map.find((node) => node.id === child)?.children
          )
          .filter((el) => el !== undefined)
          .flat();

        let children: (string | undefined)[] = [];

        if (node?.children) {
          children = [...children, ...node.children];
        }

        if (subChildren) {
          children = [...children, ...subChildren];
        }

        children = [...children, req.body.id];

        return from(
          RoadmapModel.findByIdAndUpdate(
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

// Not used Patch update node by ID
router.post("/node/:id", auth, (req, res) => {
  from(
    RoadmapModel.findOneAndUpdate(
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

// Delete Roadmap By ID
router.delete("/:id", auth, (req, res) => {
  from(RoadmapModel.findOneAndDelete({ _id: req.params.id }))
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

export default router;

export const createDefaultMap = (
  ownerId: mongoose.Types.ObjectId,
  newDefault?: boolean,
  title?: string,
  subtitle?: string
) => {
  return from(RoadmapModel.find({ owner: ownerId })).pipe(
    switchMap((roadmaps) => {
      let defaultMapIndex = -1;
      if (Array.isArray(roadmaps)) {
        defaultMapIndex = roadmaps.findIndex(
          (roadmap) => roadmap.title === "Default Roadmap Preset"
        );
      }

      if (
        (Array.isArray(roadmaps) &&
          (roadmaps.length === 0 || defaultMapIndex === -1)) ||
        newDefault
      ) {
        const center = uuid();
        const child = uuid();
        const roadmap = new RoadmapModel({
          owner: ownerId,
          title: title ? title : "Default Roadmap Preset",
          subtitle: subtitle ? subtitle : "edit me!",
          map: [
            {
              mainKnot: true,
              children: [child, "last-node"],
              id: center,
              title: "Edit me!",
              categoryId: "1",
              subtitle: "",
            },
            {
              children: [],
              id: child,
              title: "Edit me!",
              subtitle: "",
              notes: ["My first note..."],
            },
            {
              children: [],
              mainKnot: true,
              id: "last-node",
              title: "last-node",
              subtitle: "",
            },
          ],
          settings: defaultRoadmap.settings,
        });
        return from(roadmap.save()).pipe(
          catchError((err) => {
            throw new Error(err.message);
          })
        );
      } else {
        throw new Error(`Map already exists`);
      }
    })
  );
};
