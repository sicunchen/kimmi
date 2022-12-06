const fetcher = (url) => fetch(url).then((r) => r.text());
export default fetcher;
