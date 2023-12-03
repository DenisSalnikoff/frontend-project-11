import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import axios from 'axios';
import view from './view';
import resources from './languages/index';

// MODEL
const state = {
  interface: {
    valid: true,
    message: '',
  },
  hasFeed: false,
  feeds: [
    // {
    //   url,
    //   title,
    //   description,
    //   lastPubDate,
    //   posts: [
    //     {
    //       title,
    //       description,
    //       link,
    //     },
    //     item2,
    //   ],
    // },
    // feed2,
  ],
};
i18n.init({
  lng: 'ru',
  debug: true,
  resources,
});

// VIEW
const rssLinkForm = document.querySelector('form');

// CONTROLLER
const watchedState = onChange(state, view);
const proxyUrl = new URL('https://allorigins.hexlet.app/get');
const parser = new DOMParser();

// make request and parse response to rss-xml object (promise)
const getRssXml = (rssUrl) => {
  proxyUrl.searchParams.set('url', rssUrl);
  const result = axios.get(proxyUrl).then((response) => {
    const xmlDoc = parser.parseFromString(response.data.contents, 'text/xml');
    const rss = xmlDoc.querySelector('rss');
    return rss;
  });
  return result;
};

// generate new feed object
const parseRSS = (rss) => {
  const items = rss.querySelectorAll('item');
  const extractableTags = ['title', 'link', 'description', 'pubDate'];
  const posts = [];
  items.forEach((item) => posts.push(extractableTags.reduce((post, tag) => {
    const newObj = {};
    newObj[tag] = item.querySelector(tag).textContent;
    return { ...post, ...newObj };
  }, {})));
  const lastPubDate = posts.reduce((currentLastDate, { pubDate: pubDateString }) => {
    const pubDate = new Date(pubDateString);
    const time = pubDate.getTime();
    const currentLastTime = currentLastDate.getTime();
    return time > currentLastTime ? pubDate : currentLastDate;
  }, new Date(0));
  const title = rss.querySelector('channel > title').textContent;
  const description = rss.querySelector('channel > description').textContent;
  const result = {
    title,
    description,
    lastPubDate,
    posts,
  };
  return result;
};

const refreshFeed = (url) => getRssXml(url).then((rss) => {
  if (!rss) {
    return;
  }
  const oldFeed = state.feeds.find((el) => el.url === url);
  const refreshedFeed = parseRSS(rss);
  refreshedFeed.url = url;
  if (refreshedFeed.lastPubDate.getTime > oldFeed.lastPubDate.getTime()) {
    watchedState.feeds[state.feeds.indexOf(oldFeed)] = refreshedFeed;
  }
  setTimeout(() => refreshFeed(url), 5000);
});

// trying to add feed to the feedpool
const addFeed = (url) => {
  const rssPromise = getRssXml(url);
  rssPromise.then((rss) => {
    // Validating rss
    if (!rss) {
      watchedState.interface = { valid: false, message: 'invalidRss' };
      return;
    }

    const feed = parseRSS(rss);
    feed.url = url;
    watchedState.hasFeed = true;
    watchedState.feeds.push(feed);
    watchedState.interface = { valid: true, message: 'added' };
    window.setTimeout(() => refreshFeed(url), 5000);
  });
};

const app = () => {
  rssLinkForm.addEventListener('submit', (e) => {
    // getting data
    e.preventDefault();
    const formData = new FormData(e.target);

    // validating form data
    const inputUrl = formData.get('url');
    const addedUrls = state.feeds.map(({ url }) => url);
    const schema = yup.string().url('invalidURL').notOneOf(addedUrls, 'alreadyAdded');
    schema.validate(inputUrl)
    // adding feed from inputUrl
      .then(() => addFeed(inputUrl))
      .catch((error) => {
        watchedState.interface = { valid: false, message: error.message };
      });

    // clearing inputField
    const inputField = e.target.querySelector('input');
    inputField.value = '';
    inputField.focus();
  });
};

export default app;
