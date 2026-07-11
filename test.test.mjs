import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseResults } from './main.mjs';

function makeFixtureHtml() {
    return `<!DOCTYPE html>
<html><body>
<div class="mb-4">skip</div>
<div class="mb-4">skip</div>
<div class="mb-4">skip</div>
<div class="mb-4">
  <a href="/md5/abc123">Link 1</a>
  <a href="/md5/def456">Link 2</a>
  <img src="https://example.com/img1.jpg" />
  <img src="https://example.com/img2.jpg" />
  Some info text line 1
  Author Name
  2024, English, pdf
  Description text
  Some info text line 1b
  Author Two
  2023, English, epub
  Description text 2
</div>
</body></html>`;
}

describe('parseResults', () => {
    it('should parse results from fixture HTML', () => {
        const html = makeFixtureHtml();
        const result = parseResults(html, 'https://annas-archive.org/search?q=test', 'test');

        assert.equal(result.request_url, 'https://annas-archive.org/search?q=test');
        assert.equal(result.query, 'test');
        assert.ok(Array.isArray(result.results));
        assert.equal(result.results.length, 2);

        assert.equal(result.results[0].href, '/md5/abc123');
        assert.equal(result.results[0].img, 'https://example.com/img1.jpg');
        assert.ok(Array.isArray(result.results[0].info));

        assert.equal(result.results[1].href, '/md5/def456');
        assert.equal(result.results[1].img, 'https://example.com/img2.jpg');
    });

    it('should throw if .mb-4 container is missing', () => {
        assert.throws(() => {
            parseResults('<html></html>', 'url', 'q');
        }, /Annas Archive markup changed/);
    });

    it('should throw if no result links found', () => {
        const html = `<html><body><div class="mb-4">a</div><div class="mb-4">b</div><div class="mb-4">c</div><div class="mb-4">no links here</div></body></html>`;
        assert.throws(() => {
            parseResults(html, 'url', 'q');
        }, /could not find result links/);
    });
});
