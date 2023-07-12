const { User } = require("../models/user.model");

async function list(reqQuery, reqUser) {
  const { page = 0, rowsPerPage = 10 } = reqQuery;
  const where = { _id: { $ne: reqUser._id } };
  const users = await User.find(where)
    .skip(page * rowsPerPage)
    .limit(parseInt(rowsPerPage))
    .select("-password");
  const count = await User.countDocuments(where);

  return { users, count };
}

module.exports = {
  list,
};
