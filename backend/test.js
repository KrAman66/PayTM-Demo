import mongoose from "mongoose";

mongoose.connect(
  "mongodb+srv://Kr_Aman66:93RT1qpEfzM8EtkP@cluster0.xv7w0.mongodb.net/paytm_demo",
);

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});
