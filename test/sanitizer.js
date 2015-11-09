const expect = require('chai').expect,
      clean = require('../lib/sanitizer');

describe('sanitizer', function() {
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

  it.skip('removes stylesheets', done => {

  });

  it.skip('cleans images', done => {

  });

  it.skip('fixes relative urls', done => {

  });

  it.skip('removes share links', done => {

  });

  it.skip('removes empty links', done => {

  });
});
