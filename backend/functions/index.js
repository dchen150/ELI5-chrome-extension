const functions = require("firebase-functions");
const language = require("@google-cloud/language");
const fetch = require("node-fetch");

const apiKey = "AIzaSyCX_gp-8SH9JJPAVC_ayA8FVHfuJSDmBCo";

const findEntitiesHandler = async (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Credentials', 'true'); // vital
    if (request.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        response.set('Access-Control-Allow-Methods', 'GET');
        response.set('Access-Control-Allow-Headers', 'Content-Type');
        response.set('Access-Control-Max-Age', '3600');
        response.status(204).send('');
    }

    const client = new language.LanguageServiceClient();

    const document = {
        content: request.body.text,
        text: request.body.text,
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

    const stack = async () => {
        return Promise.all(redditList.map(async (entity) => {
            return searchStack(entity, 2);
        }));
    };

    const wiki = async () => {
        return Promise.all(redditList.map(async (entity) => {
            return searchWiki(entity, 3);
        }));
    };

    // search with the original text instead of NLP entity
    const googleFactCheck = async () => await searchGoogleFactCheckHandler(request.body.text, 10);

    const res = {
        redditELI5: await redditELI5(),
        redditExplained: await redditExplained(),
        stackOverFlow: await stack(),
        wiki: await wiki(),
        googleFactCheck: await googleFactCheck()
    };
    response.send(200, res);
};

const searchReddit = async (entity, type, sortBy, limit) => {
    try {
        return fetch(encodeURI(`http://www.reddit.com/search.json?q=${entity.name} ${type}&sort=${sortBy}&limit=${limit}`))
            .then((res) => res.json())
            .then((data) => {
                // data grooming
                for (let i = 0; i < data.data.children.length; ++i) {
                    const currPost = data.data.children[i].data;
                    let text = currPost["selftext"].replace("\n", "");
                    const sentenceArr = text.split('. ')
                    text = sentenceArr.slice(0, 10).join('. ') + '.'

                    data.data.children[i] = {
                        title: currPost["title"],
                        ups: currPost["ups"],
                        downs: currPost["downs"],
                        subreddit: currPost["subreddit_name_prefixed"],
                        text,
                        url: currPost["url"],
                        subreddit_id: currPost["subreddit_id"],
                        comments_url: `https://www.reddit.com/${currPost["subreddit_name_prefixed"]}/comments/${currPost["id"]}/.json`,
                    };
                }
                return data.data.children;
            });
    } catch (err) {
        return {error: err}
    }

};

const searchStack = async (max, limit) => {
    try {
        return fetch(encodeURI(`https://api.stackexchange.com/2.2/search/advanced?pagesize=${limit}&order=desc&sort=votes&accepted=True&answers=1&body=${max.name}&site=stackoverflow`))
            .then((res) => res.json())
            .then((data) => {
                    return data.items
                    // for (let i = 0; i < data.items.length; ++i) {
                    //     const currPost = data.items[i];
                    //     data.items[i] = {
                    //         title: currPost["title"],
                    //         score: currPost["score"],
                    //         answerCount: currPost["answer_count"],
                    //         text: currPost["body"]
                    //             .replace(/(<([^>]+)>)/gi, "")
                    //             .replace("\n", ""),
                    //         url: currPost["link"],
                    //     };
                    // }
                    // return data.items.slice(0, limit);
                }
            );
    } catch (err) {
        return {error: err}
    }
};

const searchWiki = async (max, limit) => {
    try {
        const result = await fetch(encodeURI(`https://en.wikipedia.org/w/api.php?format=json&action=query&list=search&srsearch=${max.name}&srlimit=${limit}&srenablerewrites&srprop=snippet|sectionsnippet|titlesnippet`))
            .then((res) => res.json())
            .then((data) => {
                const searchResult = data.query.search;


                // Parse result in order: sectionsnippet, titlesnippet, snippet
                return Promise.all(searchResult.map(async result => {

                        const {snippet, title} = result;
                        let objBuilder = {
                            title: title,
                            text: snippet,  // original searching snippet
                            // .replace(/(<([^>]+)>)/gi, "")
                            // .replace("\n", ""),
                            url: `https://en.wikipedia.org/wiki/${title}`,
                            type: "default"
                        };

                        // get the Section summary instead
                        if (result.hasOwnProperty("sectionsnippet")) {
                            console.log(2, objBuilder);
                            const {sectionsnippet} = result;
                            // Change <span class=\"searchmatch\">${text}</span> to ${text}
                            const sectionName = sectionsnippet.text.replaceAll(/<span class="searchmatch">([^\s]+)<\/span>/ig, `$1`);
                            objBuilder.text = await extractWikiSection(title, sectionName, 2);
                            objBuilder.type = "section"
                        }
                        // get the Wiki summary instead
                        else if (result.hasOwnProperty("titlesnippet")) {
                            objBuilder.text = await extractWikiSummary(title);
                            objBuilder.type = "summary"
                        }
                        return objBuilder
                    })
                );

            });

        return result.filter(result => result.text && result.text.length > 50 && !result.text.includes("may refer to"));
    } catch (e) {
        console.log(e)
        return [];
    }

};

const extractWikiSummary = async (title) => {
    // hard coded to get 3 sentences max; redirection allowed - might got the wrong summary?
    // title = title.replaceAll(' ', '_');
    try {
        return fetch(encodeURI(`https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${title}&exsentences=2`)).then((res) => {
            console.log(res);
            return res.json()
        })
            .then((data) => {
                const pages = data.query.pages;

                if (!pages) return "CANNOT FIND DATA.QUERY.OAGES";
                if (pages.hasOwnProperty('-1')) return `CANNOT EXTRACT WIKI SUMMARY OF ${title}`

                const page_id = Object.keys(pages)[0];
                return pages[page_id]["extract"]
            });
    } catch (err) {
        return "WikiSummary"
    }
}

const extractWikiSection = async (title, sectionName, maxSentenses) => {
    // redirection allowed - might cause issue?
    try {
        return fetch(encodeURI(`https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&explaintext&redirects=1&titles=${title}`)).then((res) => res.json())
            .then((data) => {
                const pages = data.query.pages || "CANNOT EXTRACT SUMMARY"
                const page_id = Object.keys(pages)[0];

                let extract = pages[page_id]["extract"]
                const sectionNameWikiFormat = `=== ${sectionName} ===`;
                extract = extract.slice(extract.indexOf(sectionNameWikiFormat) + sectionNameWikiFormat.length + 1);
                const sentenceArr = extract.split('. ')

                return sentenceArr.slice(0, maxSentenses).join('. ') + '.'
            });
    } catch (err) {
        return "WikiSection"
    }
}

const searchGoogleFactCheckHandler = async (title, limit) => {
    try {
        console.log(title)
        return await fetch(encodeURI(`https://factchecktools.googleapis.com/v1alpha1/claims:search?languageCode=en-US&pageSize=${limit}&query=${title}&key=${apiKey}`)).then((res) => res.json());
    } catch (err) {
        return "GoogleFactCheck"
    }
}

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const searchWikiHandler = async (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Credentials', 'true'); // vital
    if (request.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        response.set('Access-Control-Allow-Methods', 'GET');
        response.set('Access-Control-Allow-Headers', 'Content-Type');
        response.set('Access-Control-Max-Age', '3600');
        response.status(204).send('');
        return
    }

    response.send(200, await searchWiki({name: request.body.text}, 3));
}

const extractWikiSummaryHandler = async (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Credentials', 'true'); // vital
    if (request.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        response.set('Access-Control-Allow-Methods', 'GET');
        response.set('Access-Control-Allow-Headers', 'Content-Type');
        response.set('Access-Control-Max-Age', '3600');
        response.status(204).send('');
        return
    }

    response.send(200, await extractWikiSummary(request.body.title));
}

const extractWikiSectionHandler = async (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Credentials', 'true'); // vital
    if (request.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        response.set('Access-Control-Allow-Methods', 'GET');
        response.set('Access-Control-Allow-Headers', 'Content-Type');
        response.set('Access-Control-Max-Age', '3600');
        response.status(204).send('');
        return
    }

    response.send(200, await extractWikiSection(request.body.title, request.body.sectionName, 2));
}

const searchGoogleFactCheck = async (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Credentials', 'true'); // vital
    if (request.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        response.set('Access-Control-Allow-Methods', 'GET');
        response.set('Access-Control-Allow-Headers', 'Content-Type');
        response.set('Access-Control-Max-Age', '3600');
        response.status(204).send('');
        return
    }

    response.send(200, await searchGoogleFactCheckHandler(request.body.text, 3));
}


exports.findEntities = functions.https.onRequest(findEntitiesHandler);
exports.searchWiki = functions.https.onRequest(searchWikiHandler);
exports.extractWikiSummary = functions.https.onRequest(extractWikiSummaryHandler);
exports.extractWikiSection = functions.https.onRequest(extractWikiSectionHandler);
exports.searchGoogleFactCheck = functions.https.onRequest(searchGoogleFactCheck);
