import i18n from 'i18next';

const renderError = (value) => {
  const errorElement = document.querySelector('p.feedback');
  const cl = errorElement.classList;
  cl.remove('text-danger');
  cl.remove('text-success');
  cl.add(value.valid ? 'text-success' : 'text-danger');
  errorElement.textContent = i18n.t(`messages.${value.message}`);
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

const renderNewFeed = (feed) => {
  const feedCont = document.querySelector('.feeds ul');
  const feedEl = document.createElement('li');
  feedEl.classList.add('list-group-item', 'border-0', 'border-end-0');
  feedCont.append(feedEl);
  const feedTitle = document.createElement('h3');
  feedTitle.classList.add('h6', 'm-0');
  feedTitle.textContent = feed.title;
  feedEl.append(feedTitle);
  const feedDescription = document.createElement('p');
  feedDescription.classList.add('m-0', 'small', 'text-black-50');
  feedDescription.textContent = feed.description;
  feedEl.append(feedDescription);
};

const renderPosts = (feed, state) => {
  const { posts } = feed;
  const postCont = document.querySelector('.posts ul');

  posts.forEach((post) => {
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
    postEl.append(btn);
    const postLinkEl = postCont.querySelector(`a[href="${post.link}"]`);
    // add or replace element
    if (postLinkEl) {
      const oldPostEl = postLinkEl.parentNode;
      postCont.replaceChild(postEl, oldPostEl);
    } else {
      postCont.append(postEl);
    }
  });
};

const renderRSS = (newFeed, oldFeed, state) => {
  if (!oldFeed) {
    renderNewFeed(newFeed);
  }
  renderPosts(newFeed, state);
};

const renderPostUI = ({ link, readed }) => {
  const postLinkEl = document.querySelector(`.posts a[href="${link}"]`);
  postLinkEl.classList.remove('fw-bold', 'fw-normal');
  const readedClass = readed ? 'fw-normal' : 'fw-bold';
  postLinkEl.classList.add(readedClass);
};

const UIStateHandler = (splitedPath, value) => {
  switch (splitedPath[1]) {
    case 'posts':
      renderPostUI(value);
      break;
    default:
  }
};

export default function view(path, value, prevValue) {
  const splitedPath = path.split('.');
  switch (splitedPath[0]) {
    case 'interface':
      renderError(value);
      break;
    case 'hasFeed':
      renderFeedsHead();
      break;
    case 'feeds':
      renderRSS(value, prevValue, this);
      break;
    case 'UIState':
      UIStateHandler(splitedPath, value);
      break;
    default:
  }
}
