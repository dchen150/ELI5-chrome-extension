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
    const redditList = entities.filter((entity) => {
        return entity.salience > 0.1;
    });

    const sortBy = request.query.sortBy;
    // const limit = request.query.limit;

    const redditELI5 = async () => {
        return Promise.all(redditList.map(async (entity) => {
            return searchReddit(entity, "ELI5", sortBy, 2);
        }));
    };

    const redditExplained = async () => {
        return Promise.all(redditList.map(async (entity) => {
            return searchReddit(entity, "explained", sortBy, 2);
        }));
    };

    const wiki = async () => {
        return Promise.all(redditList.map(async (entity) => {
            return searchWiki(entity, 2);
        }));
    };

    const res = {
        redditELI5: await redditELI5(),
        redditExplained: await redditExplained(),
        // stackOverFlow: await searchStack(max, limit),
        wiki: await wiki()
    };
    response.send(200, res);
};

const searchReddit = async (entity, type, sortBy, limit) => {
    return fetch(`http://www.reddit.com/search.json?q=${entity.name} ${type}&sort=${sortBy}&limit=${limit}`)
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
                    text: currPost["selftext"].replace("\n", ""),
                    url: currPost["url"],
                };
            }
            return data.data.children;
        });
};

// const searchStack = async (max, limit) => {
//   return fetch(`https://api.stackexchange.com/2.2/search?order=desc&sort=votes&intitle=${max.name}&site=stackoverflow&key=mIk*8hZ*JrcKmhTii4eyjg((&access_token=aby1oFvv*YWo56Kt3B4cGA))&filter=withbody`)
//       .then((res) => res.json())
//       .then((data) => {
//         for (let i = 0; i < data.items.length; ++i) {
//           const currPost = data.items[i];
//           data.items[i] = {
//             title: currPost["title"],
//             score: currPost["score"],
//             answerCount: currPost["answer_count"],
//             text: currPost["body"]
//                 .replace(/(<([^>]+)>)/gi, "")
//                 .replace("\n", ""),
//             url: currPost["link"],
//           };
//         }
//         return data.items.slice(0, limit);
//       });
// };

const searchWiki = async (max, limit) => {
    return fetch(`https://en.wikipedia.org/w/api.php?format=json&action=query&list=search&srsearch=${max.name}&srlimit=${limit}&srenablerewrites&srprop=snippet|sectionsnippet|titlesnippet`)
        .then((res) => res.json())
        .then((data) => {
            console.log(data)
            const searchResult = data.query.search || [];


            // Parse result in order: sectionsnippet, titlesnippet, snippet
            return Promise.all(searchResult.map(result => {
                const {snippet, title} = result;
                let objBuilder = {
                    title: title,
                    text: snippet,  // original searching snippet
                    // .replace(/(<([^>]+)>)/gi, "")
                    // .replace("\n", ""),
                    url: `https://en.wikipedia.org/wiki/${title}`
                };

                // get the Section summary instead
                if (result.hasOwnProperty("sectionsnippet")) {
                    const {sectionsnippet} = result;
                    // Change <span class=\"searchmatch\">${text}</span> to ${text}
                    const sectionName = sectionsnippet.replaceAll(/<span class="searchmatch">([^\s]+)<\/span>/ig, `$1`);
                    objBuilder.text = extractWikiSection(title, sectionName, 3);
                }

                // get the Wiki summary instead
                else if (result.hasOwnProperty("titlesnippet")) {
                    objBuilder.text = extractWikiSummary(title);
                }

                return objBuilder
            }));

        });
};

const extractWikiSummary = async (title) => {
    // hard coded to get 3 sentences max; redirection allowed - might got the wrong summary?
    return fetch(`https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${title}&exsentences=3`).then((res) => res.json())
        .then((data) => {
            const pages = data.query.pages || "CANNOT EXTRACT SUMMARY"
            const page_id = Object.keys(pages)[0];

            return pages[page_id]["extract"]
        });
}

const extractWikiSection = async (title, sectionName, maxLength) => {
    // redirection allowed - might cause issue?
    return fetch(`https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&explaintext&redirects=1&titles=${title}`).then((res) => res.json())
        .then((data) => {
            const pages = data.query.pages || "CANNOT EXTRACT SUMMARY"
            const page_id = Object.keys(pages)[0];

            let extract = pages[page_id]["extract"]
            const sectionNameWikiFormat = `=== ${sectionName} ===`;
            extract = extract.slice(extract.indexOf(sectionNameWikiFormat) + sectionNameWikiFormat.length + 1);
            const sentenceArr = extract.split('. ')

            return sentenceArr.slice(0, maxLength).join('. ') + '.'
        });
}

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.findEntities = functions.https.onRequest(findEntitiesHandler);
