//Function for generating a Random String
function generateRandomString() {
  const stringLength = 6;
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < stringLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const urlsForUser = (id, database) => {
  const urls = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      urls[shortURL] = database[shortURL];
    }
  }
  return urls;
};

const findEmailById = (id, database) => {
  for (const user in database) {
    if (user === id) {
      return database[user].email;
    }
  }
};

const getUserByEmail = (email, database) => {
  for (const key in database) {
    if (email === database[key].email) {
      return database[key];
    }
  }
};

module.exports = {
  findEmailById,
  getUserByEmail,
  generateRandomString,
  urlsForUser,
};
