import { MongoClient } from "mongodb";
declare let clientPromise: Promise<MongoClient>;
export default clientPromise;
export declare function connectToDatabase(): Promise<import("mongodb").Db>;
//# sourceMappingURL=mongodb.d.ts.map