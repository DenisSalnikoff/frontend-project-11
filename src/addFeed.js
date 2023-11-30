import axios from 'axios';

const add = (url, getWatchedState, firstAdd = false) => {
  axios.get(`https://allorigins.hexlet.app/get?url=${url}`)
    .then((response) => {
      const watchedState = getWatchedState();
      const parser = new DOMParser();
      const rssXml = parser.parseFromString(response.data.contents, 'text/xml');
      const rss = rssXml.querySelector('rss');
      if (!rss) {
        if (firstAdd) {
          watchedState.inputError = 'invalidRss';
        } else {
          setTimeout(add(rssUrl, getWatchedState), 5000);
        }
        return;
      }
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
        return pubDate > currentLastDate ? pubDate : currentLastDate;
      }, new Date(0));
      const title = rss.querySelector('channel > title').textContent;
      const description = rss.querySelector('channel > description').textContent;
      const result = {
        url,
        title,
        description,
        lastPubDate,
        posts,
      };
      watchedState.posts.push(result);
    });
};

export default add;
