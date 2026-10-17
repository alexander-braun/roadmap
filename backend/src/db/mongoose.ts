const mongoose = require("mongoose");
const { of } = require("rxjs");
const dotenv = require("dotenv");
import dns from 'node:dns';

dotenv.config();

console.log(
  process.env.MONGO_DB_URL,
  process.env.DATABASE_NAME,
  process.env.NODE_ENV
);
const mongoURI = process.env.MONGO_DB_URL;
if (!mongoURI) {
  console.error("MongoDB URI is not set.");
  process.exit(1);
}

if (process.env.NODE_ENV === 'DEVELOPMENT') {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
}

mongoose.set("debug", process.env.NODE_ENV === "DEVELOPMENT");
of(
  mongoose.connect(mongoURI, {
    dbName: process.env.DATABASE_NAME,
    autoIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
).subscribe(() => console.log("MONGOOSE CONNECTED"));
