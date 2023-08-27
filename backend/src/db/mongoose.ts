const mongoose = require("mongoose");
const { of } = require("rxjs");

console.log(process.env.MONGO_DB_URL, process.env.DATABASE_NAME);

of(
  mongoose.connect(process.env.MONGO_DB_URL, {
    dbName: process.env.DATABASE_NAME,
    autoIndex: true,
  })
).subscribe(() => console.log("MONGOOSE CONNECTED"));
