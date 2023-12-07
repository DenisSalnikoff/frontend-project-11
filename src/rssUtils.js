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
  const extractableTags = ['title', 'link', 'description', 'pubDate'];
  const posts = [];
  items.forEach((item) => posts.push(extractableTags.reduce((post, tag) => {
    const newObj = {};
    newObj[tag] = item.querySelector(tag).textContent;
    return { ...post, ...newObj };
  }, {})));
  const lastPubDate = posts.reduce((currentLastDate, { pubDate: pubDateString }) => {
    const pubDate = new Date(pubDateString);
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

export { getRssXml, parseRSS };
