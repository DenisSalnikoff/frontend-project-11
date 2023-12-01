import axios from 'axios';

const add = (url, getWatchedState, firstAdd = false) => {
  axios.get(`https://allorigins.hexlet.app/get?url=${url}`)
    .then((response) => {
      const watchedState = getWatchedState();
      const parser = new DOMParser();
      const rssXml = parser.parseFromString(response.data.contents, 'text/xml');
      const rss = rssXml.querySelector('rss');

      // Validatin RSS
      if (!rss) {
        if (firstAdd) {
          watchedState.inputError = 'invalidRss';
        } else {
          setTimeout(() => add(url, getWatchedState), 5000);
        }
        return;
      }

      // RSS valid, set new task for refresh
      window.setTimeout(() => add(url, getWatchedState), 5000);

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
      const equilFeed = watchedState.feeds.find(({ url: currentUrl }) => currentUrl === url);
      if (!equilFeed) {
        watchedState.feeds.push(result);
        console.log(watchedState);
        return;
      }

      // Feed review
      if (equilFeed.lastPubDate.getTime() === result.lastPubDate.getTime()) {
        console.log('nothing new');
        return;
      }
      const i = watchedState.feeds.indexOf(equilFeed);
      watchedState.feeds[i] = result;
      console.log(equilFeed.lastPubDate);
      console.log(result.lastPubDate);
      console.log('updating');
    });
};

export default add;
