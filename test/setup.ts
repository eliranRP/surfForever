import * as mongoose from "mongoose";

beforeEach(async () => {
  /*
    If the mongoose connection is closed, 
    start it up using the test url and database name
    provided by the node runtime ENV
    */
  if (mongoose.connections[0].readyState !== 1) {
    try {
      const dbUniqueName = new mongoose.Types.ObjectId().toString();
      await mongoose.connect(
        process.env.MONGO_URL || "mongodb://127.0.0.1:27017",
        {
          dbName: dbUniqueName,
        }
      );
    } finally {
      await mongoose.connections[0].db.dropDatabase();
    }
  } else {
    await mongoose.connections[0].db.dropDatabase();
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});
