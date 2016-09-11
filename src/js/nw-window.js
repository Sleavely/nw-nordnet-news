
document.addEventListener('DOMContentLoaded', function() {
  var $ = function (selector) {
    return document.querySelector(selector);
  }

  $('.minimize-app').addEventListener('click', function (event) {
    win.minimize();
  });
  var maximized = false;
  $('.maximize-app').addEventListener('click', function (event) {
    if(!maximized)
    {
      win.maximize();
    }
    else
    {
      win.restore();
    }
    maximized = !maximized;
  });
  $('.close-app').addEventListener('click', function (event) {
    gui.App.quit();
  });
});
