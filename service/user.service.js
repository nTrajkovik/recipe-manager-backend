const { ObjectId } = require("mongodb");
const NoUserException = (id) => ({ error: "no user found " + id });
let userModel;

function registerModel(collection) {
  userModel = collection;
  console.log("Binded user model");
}

async function getAll() {
  return await userModel.find().toArray();
}

async function getById(id) {
  return await userModel.findOne({ _id: new ObjectId(id) });
}

async function create(author) {
  return await userModel.insertOne(author);
}

async function update(id, { username, password }) {
  const result = await userModel.findOneAndUpdate(
    {
      _id: new ObjectId(id),
    },
    {
      $set: {
        username,
        password,
      },
    },
    {
      returnOriginal: false,
    }
  );
  if (!result.value) return NoUserException(id);
  return result.value;
}

async function deleteById(id) {
  const result = await userModel.findOneAndDelete({ _id: new ObjectId(id) });
  if (!result.value) return NoUserException(id);
  return result.value;
}

module.exports = {
  registerModel,
  getAll,
  getById,
  create,
  update,
  deleteById,
};
