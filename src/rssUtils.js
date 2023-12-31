const parser = new DOMParser();
const proxyUrl = new URL('https://allorigins.hexlet.app/get');

const getProxyLink = (url) => {
  proxyUrl.searchParams.set('url', url);
  proxyUrl.searchParams.set('disableCache', true);
  return proxyUrl;
};

// get XML object from response
const getRssXml = (response) => {
  const xmlDoc = parser.parseFromString(response.data.contents, 'text/xml');
  const rssXml = xmlDoc.querySelector('rss');
  return rssXml;
};

// generate new RSS object
const parseRSS = (rss) => {
  const items = rss.querySelectorAll('item');
  const posts = [];
  items.forEach((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;
    const pubDate = item.querySelector('pubDate').textContent;
    posts.push({
      title,
      link,
      description,
      pubDate,
    });
  });
  const title = rss.querySelector('channel > title').textContent;
  const description = rss.querySelector('channel > description').textContent;
  const result = {
    title,
    description,
    posts,
  };
  return result;
};

const genFeedsAndPostsStates = (parsedRSS, feedsUrl) => {
  const posts = parsedRSS.posts.map(({
    title, link, description, pubDate,
  }) => ({
    title,
    link,
    description,
    pubDate: new Date(pubDate),
  }));
  const lastPubDate = posts.reduce((currentLastDate, { pubDate }) => {
    const time = pubDate.getTime();
    const currentLastTime = currentLastDate.getTime();
    return time > currentLastTime ? pubDate : currentLastDate;
  }, new Date(0));
  const feed = {
    url: feedsUrl,
    title: parsedRSS.title,
    description: parsedRSS.description,
    lastPubDate,
  };
  return [feed, posts];
};

export {
  getRssXml,
  parseRSS,
  genFeedsAndPostsStates,
  getProxyLink,
};
