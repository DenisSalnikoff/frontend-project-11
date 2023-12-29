import i18n from 'i18next';

const renderInputEl = (addingProcess) => {
  // submit button
  const submitBtnEl = document.querySelector('.rss-form [type="submit"]');
  submitBtnEl.removeAttribute('disabled');
  if (addingProcess.status === 'getting') {
    submitBtnEl.setAttribute('disabled', '');
  }

  // input field
  const inputField = document.querySelector('#url-input');
  inputField.focus();
  if (addingProcess.status === 'added') {
    inputField.value = '';
  }

  // feedback element
  if (addingProcess.status === 'failed') {
    return;
  }
  const feedbackElement = document.querySelector('p.feedback');
  feedbackElement.classList.remove('text-danger');
  feedbackElement.classList.add('text-success');
  feedbackElement.textContent = i18n.t(`messages.${addingProcess.status}`);
};

const renderError = (error) => {
  const feedbackElement = document.querySelector('p.feedback');
  feedbackElement.classList.remove('text-success');
  feedbackElement.classList.add('text-danger');
  feedbackElement.textContent = i18n.t(`messages.${error}`);
};

const renderFeedsHead = () => {
  // add feeds title
  const feedsEl = document.querySelector('.feeds');
  const feedsBody = document.createElement('div');
  feedsBody.classList.add('card', 'border-0');
  feedsEl.append(feedsBody);
  const feedsTitleBody = document.createElement('div');
  feedsTitleBody.classList.add('card-body');
  feedsBody.append(feedsTitleBody);
  const feedsTitle = document.createElement('h2');
  feedsTitle.classList.add('card-title', 'h4');
  feedsTitle.textContent = i18n.t('titles.feeds');
  feedsTitleBody.append(feedsTitle);
  const feedsListEl = document.createElement('ul');
  feedsListEl.classList.add('list-group', 'border-0', 'rounded-0');
  feedsBody.append(feedsListEl);

  // add posts title
  const postsEl = document.querySelector('.posts');
  const postsBody = document.createElement('div');
  postsBody.classList.add('card', 'border-0');
  postsEl.append(postsBody);
  const postsTitleBody = document.createElement('div');
  postsTitleBody.classList.add('card-body');
  postsBody.append(postsTitleBody);
  const postsTitle = document.createElement('h2');
  postsTitle.classList.add('card-title', 'h4');
  postsTitle.textContent = i18n.t('titles.posts');
  postsTitleBody.append(postsTitle);
  const postsListEl = document.createElement('ul');
  postsListEl.classList.add('list-group', 'border-0', 'rounded-0');
  postsBody.append(postsListEl);
};

const renderFeed = (feed, oldFeed) => {
  // create new feeds DOM-element
  const feedEl = document.createElement('li');
  feedEl.setAttribute('url', feed.url);
  feedEl.classList.add('list-group-item', 'border-0', 'border-end-0');
  const feedTitle = document.createElement('h3');
  feedTitle.classList.add('h6', 'm-0');
  feedTitle.textContent = feed.title;
  feedEl.append(feedTitle);
  const feedDescription = document.createElement('p');
  feedDescription.classList.add('m-0', 'small', 'text-black-50');
  feedDescription.textContent = feed.description;
  feedEl.append(feedDescription);
  // add or replace new feeds element
  const feedCont = document.querySelector('.feeds ul');
  if (oldFeed) {
    const oldFeedEl = feedCont.querySelector(`[url="${feed.url}"]`);
    feedCont.replaceChild(feedEl, oldFeedEl);
    return;
  }
  feedCont.append(feedEl);
};

const renderPosts = (post, oldPost, state) => {
  // create new element
  const postEl = document.createElement('li');
  postEl.classList.add(
    'list-group-item',
    'd-flex',
    'justify-content-between',
    'align-item-start',
    'border-0',
    'border-end-0',
  );
  // --create link
  const a = document.createElement('a');
  const { readed } = state.UIState.posts.find(({ link }) => link === post.link);
  a.classList.add(readed ? 'fw-normal' : 'fw-bold');
  a.setAttribute('href', post.link);
  a.setAttribute('target', '_blank');
  a.textContent = post.title;
  postEl.append(a);
  // --create button
  const btn = document.createElement('button');
  btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  btn.textContent = i18n.t('readBtnName');
  btn.dataset.bsToggle = 'modal';
  btn.dataset.bsWhatever = `${post.link}`;
  btn.setAttribute('href', '#modal');
  postEl.append(btn);
  // add or replace element
  const postCont = document.querySelector('.posts ul');
  if (oldPost) {
    const postLinkEl = postCont.querySelector(`a[href="${post.link}"]`);
    const oldPostEl = postLinkEl.parentNode;
    postCont.replaceChild(postEl, oldPostEl);
    return;
  }
  postCont.append(postEl);
};

const renderPostUI = ({ link, readed }) => {
  const postLinkEl = document.querySelector(`.posts a[href="${link}"]`);
  postLinkEl.classList.remove('fw-bold', 'fw-normal');
  const readedClass = readed ? 'fw-normal' : 'fw-bold';
  postLinkEl.classList.add(readedClass);
};

const renderModalPreview = ({ link, title, description }) => {
  const modalEl = document.querySelector('#modal');
  const modalTitle = modalEl.querySelector('.modal-title');
  modalTitle.textContent = title;
  const modalBody = modalEl.querySelector('.modal-body');
  modalBody.textContent = description;
  const modalPrimiryButton = modalEl.querySelector('.modal-footer .btn-primary');
  modalPrimiryButton.setAttribute('href', link);
};

export default function view(path, value, prevValue) {
  const splitedPath = path.split('.');
  switch (splitedPath[0]) {
    case 'addingProcess':
      renderInputEl(value);
      if (value.status === 'failed') {
        renderError(value.error);
      }
      break;
    case 'hasFeed':
      renderFeedsHead();
      break;
    case 'feeds':
      renderFeed(value, prevValue);
      break;
    case 'posts':
      renderPosts(value, prevValue, this);
      break;
    case 'UIState':
      renderPostUI(value);
      break;
    case 'previewedPost':
      renderModalPreview(value);
      break;
    default:
  }
}
