import fetch from "node-fetch";
import { parse } from 'node-html-parser';

const TIMEOUT_MS = 10000;
const USER_AGENT = 'Mozilla/5.0 (compatible; javagt-searchannasarchive/1.2; +https://github.com/JavaGT/javagt-searchannasarchive)';

export default async function search(query) {
    query = encodeURIComponent(query);
    const url = `https://annas-archive.org/search?q=${query}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let response;
    try {
        response = await fetch(url, {
            signal: controller.signal,
            headers: { 'User-Agent': USER_AGENT }
        });
    } finally {
        clearTimeout(timeout);
    }

    const html = await response.text();
    return parseResults(html, url, query);
}

export function parseResults(html, requestUrl, query) {
    const cleaned = html.replace(/<!--/g, '').replace(/-->/g, '');
    const document = parse(cleaned);

    const allMb4 = document.querySelectorAll('.mb-4');
    if (!allMb4 || allMb4.length < 4) {
        throw new Error('Annas Archive markup changed: could not find results container (.mb-4)');
    }

    const wrapelement = allMb4[3];
    const links = wrapelement.querySelectorAll('a');
    if (!links || links.length === 0) {
        throw new Error('Annas Archive markup changed: could not find result links');
    }

    const info = processEntry(wrapelement);
    const hrefs = links.map(a => a.getAttribute('href'));
    const imgs = wrapelement.querySelectorAll('img').map(a => a.getAttribute('src'));

    return {
        request_url: requestUrl || null,
        query: query || null,
        timestamp: Date.now(),
        results: hrefs.map((href, i) => ({
            href,
            img: imgs[i] || null,
            info: [info[i * 4], info[i * 4 + 1], info[i * 4 + 2], info[i * 4 + 3]]
        }))
    };
}

function splitTrim(x, del = ',') {
    return x.split(del).map(x => x.trim());
}

function processEntry(element) {
    return element.text.split('\n').map(x => x.trim()).filter(x => x);
}
