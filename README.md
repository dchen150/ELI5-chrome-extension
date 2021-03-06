# Mr Goose

[GitHub](https://github.com/dchen150/ELI5-chrome-extension) | [DevPost](https://devpost.com/software/mr-goose-qhe1vk)
| [Chrome Web Store](https://chrome.google.com/webstore/detail/mr-goose/jembldacfdenbcnihkhmkdlamobbobip/)
| [Slides](https://docs.google.com/presentation/d/e/2PACX-1vRYP9-rKlKq7qXTpRQJT_-1BYjMqewfx112m3Hu5yZ-xDDHRddGtt-2KTFYDifWGe7CgmHx0kHDqERU/pub?start=true&loop=false&delayms=3000)

[![Youtube: Mr Goose](logistics/0001.gif)](https://www.youtube.com/watch?v=-DDr-ZiCAsc "Everything Is AWESOME")
*Click to watch video demo. DeltaHacks 7 Hackathon project*

## Demo

![](logistics/demo.gif )

## Installation

Checkout how to install on Chrome
by [loading unpacked](https://developer.chrome.com/docs/extensions/mv3/getstarted/#manifest)

## Inspiration

πIn our current knowledge economy, our information is also our most important valuable commodity.

π‘ Knowledge is available in almost infinite abundance π, delivered directly through our digital devices π± π» , the
world is more connected and educated than ever across the globe π π π. However, the surge of information draws
adverse effectsπ₯ π₯ π! With information circulating as rapid as ever, information and cognitive overload π§ ππΌ is a
present symptom amongst our lives.

β¨π‘β¨Mr. Goose π¦’ is here to help by aggregating millions of sources to simplify complex concepts into comprehensible
language for even a five-year-old. β¨π‘β¨

## What it does

It is a chrome extension for users to conveniently type in questions, π‘ highlight π‘ paragraphs, sentences, or words on
their browser, and receive a β­οΈsimple to understand answer or explanation. π π

## How we built it

β¨π¨Our chrome extension was built using JavaScript, HTML, and CSS, using Rest API. β¨As for the backend, functions are
deployed on Google Cloud Functions βοΈβοΈβοΈand calls the Google Cloud Language APIβοΈβοΈβοΈ, which uses Natural Language
Processing π¬ π‘ to figure out what entities are in the highlighted text. Once weβve figured out what the text is about,
we use it to parse the web using APIs such as the Reddit API, the StackOverflow/Stack Exchange API, and the Wikipedia
API. β­οΈβ­οΈβ­οΈ

## Challenges we ran into

One of the πͺ main challenges πͺ we ran into was while building πΌπ©πΌβπ» π» the wireframes of the extension, discussing
π­π­ and re-evaluating the logic of the appβs uses. β¨ As we were π¨ designing π§© several features, we tried to discuss
what features would be the most user-friendly and important while also maintaining the efficiency π π π and
importance of learning/knowledge πof our Chrome extension. β¨

## Accomplishments that we're proud of

β¨β¨β¨We were extremely proud β­οΈ of the overall layout and elements π§©π§©π§© we implemented into our app design, such as the
animated goose π¦’ that one of our team members drew and animated from scratch. From the color π΄ π  π‘ choices to the
attention to details like which words π¬ π π should be important in the NLP API to the resulted information π, we had
to take a lot into consideration for our project, and it truly was a fun learning experience. πππ

## What we learned

π How to create a Chrome Extension π How to use Google Firebase π How to use Google Cloud's NLP API, Stack Exchange
API, Reddit API, Wikipedia API π How to integrate all of these together π How to create animated images for
implementation on the extensions

## What's next for Mr. Goose

β¨Adapting our extensions compatibility with other browsers. β¨Adding a voice recognition feature to allow users to ask
questions and receive simplified answers in return β¨Adding ability to access images while on the extension

## Dev setup

- Make sure using the [V2](https://developer.chrome.com/docs/extensions/mv2) documentation instead of V3 documentation
- Checkout how to install on Chrome
  by [loading unpacked](https://developer.chrome.com/docs/extensions/mv3/getstarted/#manifest)
- [WebStorm stubs](https://stackoverflow.com/a/25466708)
- [extensions reloader (alt + R)](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid)

## Made with β₯ by [Derek](https://derekchen.dev/), [Flora](https://github.com/flora-yc/), [Jiajia](https://www.jiajiakong.ca/), [Selena](https://devpost.com/chenselena), [Truman](https://www.trumanhung.tech/)

![](images/mr_goose.png )

