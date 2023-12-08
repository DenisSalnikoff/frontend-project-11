const parser = new DOMParser();

// get XML object from response
const getRssXml = (response) => {
  const xmlDoc = parser.parseFromString(response.data.contents, 'text/xml');
  const rssXml = xmlDoc.querySelector('rss');
  return rssXml;
};

// generate new feed object
const parseRSS = (rss) => {
  const items = rss.querySelectorAll('item');
  const posts = items.map((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;
    const pubDate = item.querySelector('pubDate').textContent;
    return {
      title,
      link,
      description,
      pubDate: new Date(pubDate),
    };
  });
  const lastPubDate = posts.reduce((currentLastDate, { pubDate }) => {
    const time = pubDate.getTime();
    const currentLastTime = currentLastDate.getTime();
    return time > currentLastTime ? pubDate : currentLastDate;
  }, new Date(0));
  const title = rss.querySelector('channel > title').textContent;
  const description = rss.querySelector('channel > description').textContent;
  const result = {
    title,
    description,
    lastPubDate,
    posts,
  };
  return result;
};

const getFeedObj = ({ title, description, lastPubDate }) => ({
  title,
  description,
  lastPubDate,
});

export { getRssXml, parseRSS, getFeedObj };
