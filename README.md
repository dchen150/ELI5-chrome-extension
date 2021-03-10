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

📚In our current knowledge economy, our information is also our most important valuable commodity.

💡 Knowledge is available in almost infinite abundance 📈, delivered directly through our digital devices 📱 💻 , the
world is more connected and educated than ever across the globe 🌎 🌍 🌏. However, the surge of information draws
adverse effects💥 🔥 🌈! With information circulating as rapid as ever, information and cognitive overload 🧠👎🏼 is a
present symptom amongst our lives.

✨💡✨Mr. Goose 🦢 is here to help by aggregating millions of sources to simplify complex concepts into comprehensible
language for even a five-year-old. ✨💡✨

## What it does

It is a chrome extension for users to conveniently type in questions, 💡 highlight 💡 paragraphs, sentences, or words on
their browser, and receive a ⭐️simple to understand answer or explanation. 🎇 🎆

## How we built it

✨🔨Our chrome extension was built using JavaScript, HTML, and CSS, using Rest API. ✨As for the backend, functions are
deployed on Google Cloud Functions ☁️☁️☁️and calls the Google Cloud Language API☁️☁️☁️, which uses Natural Language
Processing 💬 💡 to figure out what entities are in the highlighted text. Once we’ve figured out what the text is about,
we use it to parse the web using APIs such as the Reddit API, the StackOverflow/Stack Exchange API, and the Wikipedia
API. ⭐️⭐️⭐️

## Challenges we ran into

One of the 💪 main challenges 💪 we ran into was while building 🌼👩🏼‍💻 🌻 the wireframes of the extension, discussing
💭💭 and re-evaluating the logic of the app’s uses. ✨ As we were 🔨 designing 🧩 several features, we tried to discuss
what features would be the most user-friendly and important while also maintaining the efficiency 📈 📈 📈 and
importance of learning/knowledge 📚of our Chrome extension. ✨

## Accomplishments that we're proud of

✨✨✨We were extremely proud ⭐️ of the overall layout and elements 🧩🧩🧩 we implemented into our app design, such as the
animated goose 🦢 that one of our team members drew and animated from scratch. From the color 🔴 🟠 🟡 choices to the
attention to details like which words 💬 📃 📄 should be important in the NLP API to the resulted information 📊, we had
to take a lot into consideration for our project, and it truly was a fun learning experience. 👍👍👍

## What we learned

🌟 How to create a Chrome Extension 🌟 How to use Google Firebase 🌟 How to use Google Cloud's NLP API, Stack Exchange
API, Reddit API, Wikipedia API 🌟 How to integrate all of these together 🌟 How to create animated images for
implementation on the extensions

## What's next for Mr. Goose

✨Adapting our extensions compatibility with other browsers. ✨Adding a voice recognition feature to allow users to ask
questions and receive simplified answers in return ✨Adding ability to access images while on the extension

## Dev setup

- Make sure using the [V2](https://developer.chrome.com/docs/extensions/mv2) documentation instead of V3 documentation
- Checkout how to install on Chrome
  by [loading unpacked](https://developer.chrome.com/docs/extensions/mv3/getstarted/#manifest)
- [WebStorm stubs](https://stackoverflow.com/a/25466708)
- [extensions reloader (alt + R)](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid)

## Made with ♥ by [Derek](https://derekchen.dev/), [Flora](https://github.com/flora-yc/), [Jiajia](https://www.jiajiakong.ca/), [Selena](https://devpost.com/chenselena), [Truman](https://www.trumanhung.tech/)

![](images/mr_goose.png )

