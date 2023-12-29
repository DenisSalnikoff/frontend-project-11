import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import axios from 'axios';
import view from './view';
import resources from './languages/index';
import {
  getRssXml,
  parseRSS,
  genFeedsAndPostsStates,
  getProxyLink,
} from './rssUtils';

const app = () => {
  // MODEL
  const state = {
    addingProcess: {
      status: 'start',
      error: null,
    },
    hasFeed: false,
    feeds: [],
    posts: [],
    previewedPost: {},
    UIState: {
      posts: [],
    },
  };
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  // VIEW
  const rssLinkForm = document.querySelector('form');
  const modalEl = document.querySelector('#modal');
  const postsEl = document.querySelector('.posts');

  // CONTROLLER
  const watchedState = onChange(state, view);
  const refreshInterval = 5000;

  const setPostReaded = (link) => {
    const currentPostUIIndex = state.UIState.posts.findIndex((postUI) => postUI.link === link);
    watchedState.UIState.posts[currentPostUIIndex] = { link, readed: true };
  };

  // UIState.posts handler
  postsEl.addEventListener('click', ({ target }) => {
    if (target.tagName !== 'A') {
      return;
    }
    const link = target.getAttribute('href');
    setPostReaded(link);
  });

  // handler of submit button
  rssLinkForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // getting data
    const formData = new FormData(e.target);

    // validating form data
    const inputUrl = formData.get('url');
    const addedUrls = state.feeds.map(({ url }) => url);
    const schema = yup.string().url('invalidURL').notOneOf(addedUrls, 'alreadyAdded');
    schema.validate(inputUrl)

    // adding feed from inputUrl
      .then(() => {
        watchedState.addingProcess = { status: 'getting', error: null };
        return axios.get(getProxyLink(inputUrl));
      })
      .then((response) => {
        const rssXml = getRssXml(response);
        // Validating RSS XML object
        if (!rssXml) {
          throw new Error('invalidRss');
        }
        // Parsing rss from XML to object
        const parsedRSS = parseRSS(rssXml);

        // gen feed and posts states
        const [feed, posts] = genFeedsAndPostsStates(parsedRSS, inputUrl);

        // adding new feed
        watchedState.hasFeed = true;
        watchedState.feeds[state.feeds.length] = feed;

        // adding new posts and create UIState elemets for post
        posts.forEach((post) => {
          state.UIState.posts.push({ link: post.link, readed: false });
          watchedState.posts[state.posts.length] = post;
        });

        watchedState.addingProcess = { status: 'added', error: null };
      })
      .catch((error) => {
        const message = error.request ? 'requestError' : error.message;
        watchedState.addingProcess = { status: 'failed', error: message };
      });
  });

  // handler of modal window
  modalEl.addEventListener('show.bs.modal', (e) => {
    const button = e.relatedTarget;
    const link = button.getAttribute('data-bs-whatever');
    const { title, description } = state.posts.find((el) => el.link === link);
    watchedState.previewedPost = { link, title, description };
    setPostReaded(link);
  });

  // post updater
  const refreshFeeds = () => {
    const refreshFeedPromises = state.feeds.map(({ url }) => axios.get(getProxyLink(url))
      .then((response) => {
        const rssXml = getRssXml(response);
        // validating RSS XML object
        if (!rssXml) {
          return;
        }
        const parsedRSS = parseRSS(rssXml);
        // get new and old feeds objects
        const [newFeed, posts] = genFeedsAndPostsStates(parsedRSS, url);
        const oldFeed = state.feeds.find((el) => el.url === url);
        // compare last public date of new and old feeds objects
        if (newFeed.lastPubDate.getTime() === oldFeed.lastPubDate.getTime()) {
          return;
        }

        // replace feed
        watchedState.feeds[state.feeds.indexOf(oldFeed)] = newFeed;

        // replace or add posts if it need
        posts.forEach((newPost) => {
          const oldPost = state.posts.find(({ link }) => newPost.link === link);
          // replace case
          if (oldPost && oldPost.pubDate.getTime() < newPost.pubDate.getTime()) {
            const oldPostUIIndex = state.UIState.posts
              .findIndex(({ link }) => newPost.link === link);
            state.UIState.posts[oldPostUIIndex] = { link: newPost.link, readed: false };
            watchedState.posts[state.posts.indexOf(oldPost)] = newPost;
          }
          // add case
          if (!oldPost) {
            state.UIState.posts.push({ link: newPost.link, readed: false });
            watchedState.posts[state.posts.length] = newPost;
          }
        });
      }));
    Promise.all(refreshFeedPromises)
      .finally(() => setTimeout(() => refreshFeeds(), refreshInterval));
  };
  // Run updater
  refreshFeeds();
};

export default app;
