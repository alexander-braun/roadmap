const mongoose = require("mongoose");
const { of } = require("rxjs");
const dotenv = require("dotenv");
dotenv.config();

console.log(process.env.MONGO_DB_URL, process.env.DATABASE_NAME);
const mongoURI = process.env.MONGO_DB_URL;
if (!mongoURI) {
  console.error("MongoDB URI is not set.");
  process.exit(1);
}
mongoose.set("debug", process.env.ENV === "DEVELOPMENT");
of(
  mongoose.connect(mongoURI, {
    dbName: process.env.DATABASE_NAME,
    autoIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
).subscribe(() => console.log("MONGOOSE CONNECTED"));
