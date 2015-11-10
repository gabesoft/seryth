const expect = require('chai').expect,
      clean = require('../lib/sanitizer');

describe('sanitizer', () => {
  it('removes iframes', done => {
    const html = `<html>
                    <iframe width="560" height="315" src="https://www.youtube.com/embed/m5_AKjDdqaU" frameborder="0" allowfullscreen="" class="carousel-slide" data-carousel-index="6" tabindex="-1" style="width: 769px;"></iframe>
                    <div></div>
                  </html>`;

    clean(html, '', (err, data) => {
      expect(data.trim()).to.eq(`<div></div>`);
      done(err);
    });
  });

  it('removes script tags', done => {
    const html = `<html>
                    <script src="http://code.jquery.com/jquery-migrate-1.2.1.min.js"></script>
                    <div></div>
                  </html>`;

    clean(html, '', (err, data) => {
      expect(data.trim()).to.eq(`<div></div>`);
      done(err);
    });
  });

  it('removes stylesheets', done => {
    const html = `<html>
                    <link href="main.css" rel="stylesheet"/>
                    <link href="other.css" rel="stylesheet"/>
                    <div></div>
                  </html>`;

    clean(html, '', (err, data) => {
      expect(data.trim()).to.eq(`<div></div>`);
      done(err);
    });
  });

  it('cleans images', done => {
    const html = `<html>
                    <img width="230" src="u/2937359?v=3&amp;s=460">
                    <img width="230" src="/2937359?v=3&amp;s=460">
                    <img width="230" src="https://avatars2.githubusercontent.com/u/2937359?v=3&amp;s=460">
                    <div></div>
                  </html>`,
          expected = `<img width="230" src="http://mypost.com/u/2937359?v=3&amp;s=460">
                    <img width="230" src="http://mypost.com/2937359?v=3&amp;s=460">
                    <img width="230" src="https://avatars2.githubusercontent.com/u/2937359?v=3&amp;s=460">
                    <div></div>`;

    clean(html, 'http://mypost.com', (err, data) => {
      expect(data.trim()).to.eq(expected);
      done(err);
    });
  });

  it('fixes relative urls', done => {
    const html = `<html>
                    <a href="u/2937359?v=3&amp;s=460">Link</a>
                    <a href="/2937359?v=3&amp;s=460">Link</a>
                    <a href="https://avatars2.githubusercontent.com/u/2937359?v=3&amp;s=460">Link</a>
                    <div></div>
                  </html>`,
          expected = `<a href="http://mypost.com/u/2937359?v=3&amp;s=460">Link</a>
                    <a href="http://mypost.com/2937359?v=3&amp;s=460">Link</a>
                    <a href="https://avatars2.githubusercontent.com/u/2937359?v=3&amp;s=460">Link</a>
                    <div></div>`;

    clean(html, 'http://mypost.com', (err, data) => {
      expect(data.trim()).to.eq(expected);
      done(err);
    });
  });

  it('removes share links', done => {
    const html = `<html>
                    <div class="feedflare"></div>
                    <div></div>
                  </html>`;

    clean(html, '', (err, data) => {
      expect(data.trim()).to.eq(`<div></div>`);
      done(err);
    });
  });

  it('removes empty links', done => {
    const html = `<html>
                    <a href="u/2937359?v=3&amp;s=460"></a>
                    <a href="/2937359?v=3&amp;s=460"></a>
                    <div></div>
                  </html>`;

    clean(html, '', (err, data) => {
      expect(data.trim()).to.eq(`<div></div>`);
      done(err);
    });
  });
});
