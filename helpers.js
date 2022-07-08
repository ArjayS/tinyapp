//Function for generating a Random String
function generateRandomString() {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
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

const findEmailbyId = (id, database) => {
  for (const user in database) {
    if (user === id) {
      return database[user].email;
    }
  }
  return null;
};

const getUserByEmail = (email, db) => {
  for (let key in db) {
    if (db[key].email === email) {
      return db[key];
    }
  }
  return undefined;
};

module.exports = {
  findEmailbyId,
  getUserByEmail,
  generateRandomString,
  urlsForUser,
};
