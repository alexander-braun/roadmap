import mongoose, {
  CallbackWithoutResultAndOptionalError,
  HydratedDocument,
  InferSchemaType,
} from "mongoose";
import {
  Observable,
  from,
  switchMap,
  throwError,
  of,
  catchError,
  EMPTY,
} from "rxjs";
import validator from "validator";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { RoadmapModel } from "./roadmap";
import { v4 as uuid } from "uuid";
import { Model } from "mongoose";
import { defaultRoadmap } from "../data/default-roadmap";

export interface IUser {
  email: string;
  password: string;
  tokens: { token: string }[];
}

interface IUserMethods {
  generateAuthToken: () => Observable<string>;
}

interface IUserModel extends Model<IUser, {}, IUserMethods> {
  findByCredentials: (
    email: string,
    password: string
  ) => Observable<HydratedDocument<IUser, IUserMethods>>;
}

const userSchema = new mongoose.Schema<IUser, IUserModel, IUserMethods>(
  {
    email: {
      unique: true,
      type: String,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error("Not a valid email");
        }
      },
      trim: true,
      lowercase: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      validate(value: string) {
        if (value.toLowerCase() === "password") {
          throw new Error("Not a valid password");
        }
      },
    },
    tokens: {
      type: [
        {
          token: {
            type: String,
            required: true,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// relationship between user and roadmap
// links _id from user to owner field in roadmap
userSchema.virtual("roadmaps", {
  ref: "Roadmap",
  // where local data is stored - _id on roadmap associated with _id on user
  localField: "_id",
  // name of the field on the roadmap to create relationship
  foreignField: "owner",
});

userSchema.pre("save", { document: true }, function (next) {
  if (this.isModified("password")) {
    from(bcryptjs.hash(this.password, 12)).subscribe((password) => {
      this.password = password;
      next();
    });
  } else {
    next();
  }
});

userSchema.pre(
  "save",
  { document: true },
  function (next: CallbackWithoutResultAndOptionalError) {
    const id = this._id;
    generateDefaultRoadmapForUser(id, next);
  }
);

userSchema.pre(
  "save",
  { document: true },
  function (next: CallbackWithoutResultAndOptionalError) {
    const id = this._id;
    generateDefaultFrontendRoadmap(id, next);
  }
);

export const generateDefaultFrontendRoadmap = (
  id: mongoose.Types.ObjectId,
  next: CallbackWithoutResultAndOptionalError
) => {
  from(RoadmapModel.find({ owner: id }))
    .pipe(
      switchMap((roadmaps) => {
        if (Array.isArray(roadmaps)) {
          let exists = false;
          roadmaps.forEach((roadmap) => {
            if (roadmap.title === "Frontend Developer") {
              exists = true;
            }
          });

          if (!exists) {
            const roadmap = new RoadmapModel({
              ...defaultRoadmap,
              owner: id,
            });
            return from(roadmap.save()).pipe(
              catchError(() => {
                return EMPTY;
              })
            );
          }
        }
        return EMPTY;
      })
    )
    .subscribe({
      complete: () => next(),
    });
};

export const generateDefaultRoadmapForUser = (
  id: mongoose.Types.ObjectId,
  next: CallbackWithoutResultAndOptionalError
) => {
  from(RoadmapModel.find({ owner: id }))
    .pipe(
      switchMap((roadmaps) => {
        if (Array.isArray(roadmaps) && roadmaps.length === 0) {
          const center = uuid();
          const child = uuid();
          const roadmap = new RoadmapModel({
            owner: id,
            title: "Default Roadmap Preset",
            subtitle: "edit me!",
            map: [
              {
                mainKnot: true,
                children: [child],
                id: center,
                title: "Edit me!",
                categoryId: "1",
              },
              {
                children: [],
                id: child,
                title: "Edit me!",
                notes: ["My first note..."],
              },
            ],
          });
          return from(roadmap.save()).pipe(
            catchError(() => {
              return EMPTY;
            })
          );
        } else {
          return EMPTY;
        }
      })
    )
    .subscribe({
      complete: () => next(),
    });
};

// Delte all related roadmaps and nodes
userSchema.pre("deleteOne", { document: true }, function (next) {
  from(RoadmapModel.deleteMany({ owner: this._id })).subscribe(() => next());
});

// Static methods are accessible on the model of User
userSchema.static(
  "findByCredentials",
  function findByCredentials(
    email: string,
    password: string
  ): Observable<IUser> {
    return from(UserModel.findOne({ email })).pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error("Email not found"));
        } else {
          return from(bcryptjs.compare(password, user.password)).pipe(
            switchMap((match) => {
              if (!match) {
                return throwError(() => new Error("Wrong password"));
              } else {
                return of(user);
              }
            })
          );
        }
      })
    );
  }
);

// Methods methods are accessible on the instance of User
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id.toString() },
    process.env.JWT_SECRET || "",
    {
      expiresIn: "1minute",
    }
  );
  this.tokens = this.tokens.concat({ token });
  return from(this.save()).pipe(switchMap(() => of(token)));
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.tokens;
  return user;
};

export type UserType = InferSchemaType<typeof userSchema>;
export const UserModel = mongoose.model<IUser, IUserModel>("User", userSchema);
