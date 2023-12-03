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

const addNewFeed = (newFeed, postCont, feedCont) => {
  const feedEl = document.createElement('li');
  feedEl.classList.add('list-group-item', 'border-0', 'border-end-0');
  feedCont.append(feedEl);
  const feedTitle = document.createElement('h3');
  feedTitle.classList.add('h6', 'm-0');
  feedTitle.textContent = newFeed.title;
  feedEl.append(feedTitle);
  const feedDescription = document.createElement('p');
  feedDescription.classList.add('m-0', 'small', 'text-black-50');
  feedDescription.textContent = newFeed.description;
  feedEl.append(feedDescription);
};

const editPosts = (modFeed, postCont, feedCont) => {

};

const renderFeedsList = (newFeeds, oldFeeds) => {
  const postCont = document.querySelector('.posts ul');
  const feedCont = document.querySelector('.feeds ul');
  if (newFeeds.length !== oldFeeds) {
    addNewFeed(newFeeds[newFeeds.length - 1], postCont, feedCont);
    return;
  }
  const modFeed = newFeeds.find((feed, i) => feed !== oldFeeds[i]);
  editPosts(modFeed, postCont, feedCont);
}

export default (path, value, prevValue) => {
  switch (path) {
    case 'interface':
      renderError(value);
      break;
    case 'hasFeed':
      renderFeedsHead();
      break;
    case 'feeds':
      renderFeedsList(value, prevValue);
      break;
    default:
  }
};
