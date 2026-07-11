# Search Anna's Archive

Scrapes [Anna's Archive](https://annas-archive.org) search results. Returns metadata about each result including link, cover image, and parsed info fields.

## Usage

```js
import search from "javagt-searchannasarchive";

const results = await search("moby dick");
console.log(results);
// {
//   request_url: 'https://annas-archive.org/search?q=moby+dick',
//   query: 'moby dick',
//   timestamp: 1670202830960,
//   results: [
//     { href: '/md5/...', img: 'https://...', info: ['...', '...', '...', '...'] },
//     ...
//   ]
// }
```

## API

### `search(query: string): Promise<SearchResult>`

- `query` — plain text search term (encoded automatically)
- Returns `{ request_url, query, timestamp, results }` where `results` is an array of `{ href, img, info }`.

### `parseResults(html: string, url?: string, query?: string): SearchResult`

Pure function that parses Anna's Archive HTML directly — useful for testing without network.

## Notes

- Works via webscraping, so vulnerable to markup changes.
- Uses `AbortController` with a 10-second timeout on the HTTP fetch.
- Sends a realistic `User-Agent` header.
