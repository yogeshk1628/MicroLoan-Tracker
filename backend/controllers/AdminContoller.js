const User = require("../models/UserModel");


const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: "User deleted succesfully", deletedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getAllusers = async (req, res) => {

  try {
      const allUsers = await User.find();
      if (!allUsers) {
          return res.status(404).json({ message: "No users found" })
      }
      res.status(200).json({ message: "Users fetched ", data: allUsers })
  } catch (error) {
      console.log(error);
  }
};

module.exports = { deleteUser, getAllusers }