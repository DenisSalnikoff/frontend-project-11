import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import axios from 'axios';
import view from './view';
import resources from './languages/index';
import { getRssXml, parseRSS } from './rssUtils';

const app = () => {
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
    previewsPost: null,
    UIState: {
      posts: [
        // {
        //   link,
        //   readed,
        // },
        // post2,
      ],
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
  const proxyUrl = new URL('https://allorigins.hexlet.app/get');

  const setPostReaded = (link) => {
    const currentPostUIIndex = state.UIState.posts.findIndex((postUI) => postUI.link === link);
    watchedState.UIState.posts[currentPostUIIndex] = { link, readed: true };
  };

  // set click listener to all post of unput feed. Listener making link viewed
  const addClickListenersToPosts = (feed) => {
    const postsBlock = document.querySelector('.posts');
    feed.posts.forEach(({ link }) => {
      const postEl = postsBlock.querySelector(`a[href="${link}"]`);
      postEl.addEventListener('click', () => setPostReaded(link));
    });
  };

  // refresh posts of feed every 5 sec
  const refreshFeed = (url) => {
    proxyUrl.searchParams.set('url', url);
    axios.get(proxyUrl)
      .then((response) => {
        const rssXml = getRssXml(response);
        // validating RSS XML object
        if (rssXml) {
          const oldFeed = state.feeds.find((el) => el.url === url);
          const refreshedFeed = parseRSS(rssXml);
          refreshedFeed.url = url;
          // compare last public date of new and old feeds objects
          if (refreshedFeed.lastPubDate.getTime() > oldFeed.lastPubDate.getTime()) {
            refreshedFeed.posts.forEach((refrPost) => {
              const postUI = state.UIState.posts.find(({ link }) => refrPost.link === link);
              if (!postUI) {
                state.UIState.posts.push({ link: refrPost.link, readed: false });
              }
            });
            watchedState.feeds[state.feeds.indexOf(oldFeed)] = refreshedFeed;
            addClickListenersToPosts(refreshedFeed);
          }
        }
        setTimeout(() => refreshFeed(url), 5000);
      })
      .catch(() => setTimeout(() => refreshFeed(url), 5000));
  };

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
        proxyUrl.searchParams.set('url', inputUrl);
        return axios.get(proxyUrl);
      })
      .then((response) => {
        const rssXml = getRssXml(response);
        // Validating RSS XML object
        if (!rssXml) {
          throw new Error('invalidRss');
        }

        // Parsing rssXML to feed object
        const feed = parseRSS(rssXml);
        feed.url = inputUrl;

        // create UIState elemets for post
        feed.posts.forEach(({ link }) => state.UIState.posts.push({ link, readed: false }));

        // adding new posts
        watchedState.hasFeed = true;
        watchedState.feeds[watchedState.feeds.length] = feed;
        watchedState.interface = { valid: true, message: 'added' };
        addClickListenersToPosts(feed);
        window.setTimeout(() => refreshFeed(feed.url), 5000);
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
    const posts = state.feeds.flatMap((feed) => feed.posts);
    const { title, description } = posts.find((post) => post.link === link);
    const modalTitle = modalEl.querySelector('.modal-title');
    modalTitle.textContent = title;
    const modalBody = modalEl.querySelector('.modal-body');
    modalBody.textContent = description;
    const modalPrimiryButton = modalEl.querySelector('.modal-footer .btn-primary');
    modalPrimiryButton.setAttribute('href', link);
    setPostReaded(link);
  });
};

export default app;
