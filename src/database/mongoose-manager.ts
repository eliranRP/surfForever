import * as mongoose from "mongoose";
import logger from "../framework/logger.manager";

export class MongoManager {
  public static connect() {
    const connection =
      process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/surfline";
    if (!mongoose.connection || mongoose.connection.readyState == 0) {
      return mongoose
        .connect(connection)
        .then((res) => {
          logger.info("DB connection success!");
          return res;
        })
        .catch((error) => {
          logger.error("connection error:", error);
        }); // connect to db
    }
  }

  public static async disconnect() {
    return await mongoose?.connection?.close();
  }
}
