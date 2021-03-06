const functions = require("firebase-functions");
const language = require("@google-cloud/language");

const findEntitiesHandler = async (request, response) => {
  const client = new language.LanguageServiceClient();

  const document = {
    content: request.body.text,
    type: "PLAIN_TEXT",
  };

  const [result] = await client.analyzeEntities({document});

  const entities = result.entities;
  response.send(200, {
    entities,
  });
};

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

exports.findEntities = functions.https.onRequest(findEntitiesHandler);
