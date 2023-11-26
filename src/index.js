import './style.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import view from './view';

const rssLinkForm = document.querySelector('form');

const state = {
  inputError: null,
  rssUrls: [],
};

const watchedState = onChange(state, view);
rssLinkForm.addEventListener('submit', (e) => {
  // getting data
  e.preventDefault();
  const formData = new FormData(e.target);
  // validating
  const schema = yup.string().url('invalidURL').notOneOf(state.rssUrls, 'alreadyAdded');
  schema.validate(formData.get('url'))
    .then((link) => {
      watchedState.inputError = null;
      watchedState.rssUrls.push(link);
    })
    .catch((error) => {
      watchedState.inputError = error.message;
    });
  const inputField = e.target.querySelector('input');
  // clear inputField
  inputField.value = '';
  inputField.focus();
});
