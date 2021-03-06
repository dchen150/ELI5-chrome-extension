const functions = require("firebase-functions");
const language = require("@google-cloud/language");
const fetch = require("node-fetch");

const findEntitiesHandler = async (request, response) => {
  const client = new language.LanguageServiceClient();

  const document = {
    content: request.body.text,
    type: "PLAIN_TEXT",
  };

  const [result] = await client.analyzeEntities({document});

  const entities = result.entities;

  const max = entities.reduce(function(prev, current) {
    return (prev.salience > current.salience) ? prev : current;
  });

  const res = {
    reddit: searchReddit(max, "relevance", 5),
  };
  // searchStackOverFlow(max);
  response.send(200, res);
};

const searchReddit = async (max, sortBy, limit) => {
  return fetch(`http://www.reddit.com/search.json?q=${max.name} ELI5&sort=${sortBy}&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        // data grooming
        functions.logger.info("data derek: ", typeof data);
        functions.logger.info("data derek: ", data.data.children);
        // for (let i = 0; i < data.children.length; ++i) {
        //   const currPost = data.children[i].data;
        //   data.children[i] = {
        //     title: currPost["title"],
        //     ups: currPost["ups"],
        //     downs: currPost["downs"],
        //     subreddit: currPost["subreddit_name_prefixed"],
        //     text: currPost["selftext"],
        //     url: currPost["url"],
        //   };
        // }
        // functions.logger.info("data derek: ", data.children);
        return data.data.children;
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