import mongoose from "mongoose";

async function deleteAllData() {
  await mongoose.connect("mongodb+srv://technovahubcareer_db_user:wdpptcNNY8GPm5Zv@cluster0.x6flnvj.mongodb.net/dev");

  await mongoose.connection.db.dropDatabase();

  console.log("✅ All data deleted");
  process.exit();
}

deleteAllData();
