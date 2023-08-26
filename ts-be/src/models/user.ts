import mongoose from "mongoose";
import {
  Observable,
  from,
  switchMap,
  throwError,
  of,
  tap,
  catchError,
  EMPTY,
} from "rxjs";
import validator from "validator";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { Roadmap } from "./roadmap";
import { v4 as uuid } from "uuid";
import IUser, { UserModel } from "./user.model";

const userSchema = new mongoose.Schema<IUser, UserModel>(
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

userSchema.pre("save", { document: true }, function (next) {
  const id = this._id;
  from(Roadmap.find({ owner: id }))
    .pipe(
      switchMap((roadmaps) => {
        if (Array.isArray(roadmaps) && roadmaps.length === 0) {
          const center = uuid();
          const child = uuid();
          const roadmap = new Roadmap({
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
});

// Delte all related roadmaps and nodes
userSchema.pre("deleteOne", { document: true }, function (next) {
  from(Roadmap.deleteMany({ owner: this._id })).subscribe(() => next());
});

// Static methods are accessible on the model of User
userSchema.static(
  "findByCredentials",
  function findByCredentials(
    email: string,
    password: string
  ): Observable<IUser> {
    return from(User.findOne({ email })).pipe(
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
      expiresIn: "1week",
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

const User = mongoose.model<IUser, UserModel>("User", userSchema);

export default User;
