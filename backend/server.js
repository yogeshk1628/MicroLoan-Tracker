const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cors = require("cors");

const UserRoutes = require("./routes/UserRoutes");
const LoanRoutes = require("./routes/LoanRoutes");
const AdminRoutes = require("./routes/AdminRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", UserRoutes);
app.use("/api", LoanRoutes);
app.use("/admin", AdminRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server Running on PORT ${PORT}`);
});