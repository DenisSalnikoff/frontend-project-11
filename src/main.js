import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import axios from 'axios';
import view from './view';
import resources from './languages/index';
import {
  getRssXml,
  parseRSS,
  getFeedObj,
  getProxyLink,
} from './rssUtils';

const app = () => {
  // MODEL
  const state = {
    interface: {
      valid: true,
      message: '',
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
    debug: true,
    resources,
  });

  // VIEW
  const rssLinkForm = document.querySelector('form');
  const modalEl = document.querySelector('#modal');

  const resetInputField = () => {
    const inputField = rssLinkForm.querySelector('input');
    inputField.value = '';
    inputField.focus();
  };

  // CONTROLLER
  const watchedState = onChange(state, view);
  const refreshInterval = 5000;

  const setPostReaded = (link) => {
    const currentPostUIIndex = state.UIState.posts.findIndex((postUI) => postUI.link === link);
    watchedState.UIState.posts[currentPostUIIndex] = { link, readed: true };
  };

  // set click listener to all post of unput feed. Listener making link viewed
  const addClickListenersToPosts = (posts) => {
    const postsBlock = document.querySelector('.posts');
    posts.forEach(({ link }) => {
      const postEl = postsBlock.querySelector(`a[href="${link}"]`);
      postEl.addEventListener('click', () => setPostReaded(link));
    });
  };

  // refresh posts of feed every 5 sec
  const refreshFeeds = () => {
    const refreshFeedPromises = state.feeds.map(({ url }) => axios.get(getProxyLink(url))
      .then((response) => {
        const rssXml = getRssXml(response);
        // validating RSS XML object
        if (!rssXml) {
          return;
        }
        const rssObj = parseRSS(rssXml);
        // get new and old feeds objects
        const newFeed = { ...getFeedObj(rssObj), url };
        const oldFeed = state.feeds.find((el) => el.url === url);
        // compare last public date of new and old feeds objects
        if (newFeed.lastPubDate.getTime() === oldFeed.lastPubDate.getTime()) {
          return;
        }

        // replace feed
        watchedState.feeds[state.feeds.indexOf(oldFeed)] = newFeed;

        // replace or add posts if it need
        rssObj.posts.forEach((newPost) => {
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
        addClickListenersToPosts(rssObj.posts);
      }));
    Promise.all(refreshFeedPromises)
      .finally(() => setTimeout(() => refreshFeeds(), refreshInterval));
  };
  // Run updater
  refreshFeeds();

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
        watchedState.interface = { valid: true, message: 'gettingRSS' };
        return axios.get(getProxyLink(inputUrl));
      })
      .then((response) => {
        const rssXml = getRssXml(response);
        // Validating RSS XML object
        if (!rssXml) {
          throw new Error('invalidRss');
        }
        // Parsing rss from XML to object
        const rssObj = parseRSS(rssXml);

        // getting feed info
        const feed = { ...getFeedObj(rssObj), url: inputUrl };

        // adding new feed
        watchedState.hasFeed = true;
        watchedState.feeds[state.feeds.length] = feed;

        // adding new posts and create UIState elemets for post
        rssObj.posts.forEach((post) => {
          state.UIState.posts.push({ link: post.link, readed: false });
          watchedState.posts[state.posts.length] = post;
        });
        addClickListenersToPosts(rssObj.posts);

        watchedState.interface = { valid: true, message: 'added' };
      })
      .catch((error) => {
        const message = error.request ? 'requestError' : error.message;
        watchedState.interface = { valid: false, message };
      });

    // clearing inputField
    resetInputField();
  });

  // handler of modal window
  modalEl.addEventListener('show.bs.modal', (e) => {
    const button = e.relatedTarget;
    const link = button.getAttribute('data-bs-whatever');
    const { title, description } = state.posts.find((el) => el.link === link);
    watchedState.previewedPost = { link, title, description };
    setPostReaded(link);
  });
};

export default app;
