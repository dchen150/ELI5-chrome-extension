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

  functions.logger.info("entities", entities);

  const max = entities.reduce(function(prev, current) {
    return (prev.salience > current.salience) ? prev : current;
  });

  const res = {
    reddit: await searchReddit(max, request.query.sortBy, request.query.limit),
    stackOverFlow: await searchStack(max),
  };
  // searchStackOverFlow(max);
  response.send(200, res);
};

const searchReddit = async (max, sortBy, limit) => {
  return fetch(`http://www.reddit.com/search.json?q=${max.name} ELI5&sort=${sortBy}&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        // data grooming
        for (let i = 0; i < data.data.children.length; ++i) {
          const currPost = data.data.children[i].data;
          data.data.children[i] = {
            title: currPost["title"],
            ups: currPost["ups"],
            downs: currPost["downs"],
            subreddit: currPost["subreddit_name_prefixed"],
            text: currPost["selftext"],
            url: currPost["url"],
          };
        }
        return data.data.children;
      });
};

const searchStack = async (max) => {
  return fetch(`https://api.stackexchange.com/2.2/search?order=desc&sort=votes&intitle=${max.name}&site=stackoverflow&key=mIk*8hZ*JrcKmhTii4eyjg((&access_token=aby1oFvv*YWo56Kt3B4cGA))&filter=withbody`)
      .then((res) => res.json())
      .then((data) => {
        for (let i = 0; i < data.items.length; ++i) {
          const currPost = data.items[i];
            data.items[i] = {
              title: currPost["title"],
              score: currPost["score"],
              answerCount: currPost["answer_count"],
              text: currPost["body"],
              url: currPost["link"]
            }
    
        }
          return data.items.slice(0,5);
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
