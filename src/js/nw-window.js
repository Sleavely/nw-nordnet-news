
document.addEventListener('DOMContentLoaded', function() {
  var $ = function (selector) {
    return document.querySelector(selector);
  }

  $('.minimize-app').addEventListener('click', function (event) {
    win.minimize();
  });
  $('.close-app').addEventListener('click', function (event) {
    gui.App.quit();
  });
});
