import './style.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import axios from 'axios';
import view from './view';
import resources from '../i18n/index';

const state = {
  inputError: null,
  rssUrls: [],
};
i18n.init({
  lng: 'ru',
  debug: true,
  resources,
});

const rssLinkForm = document.querySelector('form');
const rssContent = document.querySelector('div.posts');

const watchedState = onChange(state, view);
const parser = new DOMParser();
rssLinkForm.addEventListener('submit', (e) => {
  // getting data
  e.preventDefault();
  const formData = new FormData(e.target);
  // validating
  const schema = yup.string().url('invalidURL').notOneOf(state.rssUrls, 'alreadyAdded');
  schema.validate(formData.get('url'))
    .catch((error) => {
      watchedState.inputError = error.message;
      throw new Error('stop');
    })
    .then((link) => {
      watchedState.inputError = null;
      watchedState.rssUrls.push(link);
      return axios.get(`https://allorigins.hexlet.app/get?url=${link}`);
    })
    .then((response) => {
      const rssXml = parser.parseFromString(response.data.contents, 'text/xml');
      //rssContent.append(rssXml.firstChild);
      console.log(rssXml);
    });
  const inputField = e.target.querySelector('input');
  // clear inputField
  inputField.value = '';
  inputField.focus();
});
