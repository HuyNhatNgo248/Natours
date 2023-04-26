const functions = require("firebase-functions");
const app = require("./app");

//safety net
process.on("uncaughtException", (err) => {
  console.log("UNHANDLED REJECTION 🥵 shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

exports.natours = functions.https.onRequest(app);

// const port = process.env.PORT || 4000;
// const server = app.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });
