const fs = require("fs");
const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) console.log("Unable to delete file...");
    else console.log("Post successful deleted from internal directory");
  });
};

module.exports = deleteFile;
