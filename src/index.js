import './style.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import view from './view';
import resources from '../i18n/index';
import addFeed from './addFeed';

const state = {
  inputError: null,
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

const rssLinkForm = document.querySelector('form');

const watchedState = onChange(state, view);
rssLinkForm.addEventListener('submit', (e) => {
  // getting data
  e.preventDefault();
  const formData = new FormData(e.target);
  // validating
  const inputUrl = formData.get('url');
  const addedUrls = state.feeds.map(({ url }) => url);
  const schema = yup.string().url('invalidURL').notOneOf(addedUrls, 'alreadyAdded');
  const stopError = new Error('stop');
  schema.validate(inputUrl)
    .catch((error) => {
      watchedState.inputError = error.message;
      throw stopError;
    })
    .then(() => {
      watchedState.inputError = null;
      const getWatchedState = () => watchedState;
      addFeed(inputUrl, getWatchedState, true);
    });
  const inputField = e.target.querySelector('input');
  // clear inputField
  inputField.value = '';
  inputField.focus();
});
