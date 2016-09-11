var request = require('request');
var querystring = require('querystring');

// Set some defaults
var cookiejar = request.jar();
request = request.defaults({
  jar: cookiejar,
  headers: {
    // Let's give Nordnet a fighting chance to outright block us
    'User-Agent': 'NewsNotifier/1.0 (+https://github.com/Sleavely/nw-nordnet-news)'
  }
});

// Keep track of which news items we already notified about
var readNews = localStorage.getItem('readNews') || '[]';
readNews = JSON.parse(readNews);
var printedNews = [];

jQuery(document).ready(function(){

  // This is a pretty decent debugging feature. Not really necessary in prod, is it?
  var $console = jQuery('#console');
  var log = function(obj, skipJson){
    var timestamp = (new Date).toLocaleTimeString();
    var $span = jQuery('<span></span>');
    $span.text(timestamp + ' ' + (skipJson ? obj : JSON.stringify(obj)) + '\n')
    $console.append($span);

    // need to kill lines occassionally.
    var $children = $console.children();
    if($children.length >= 50)
    {
      $console.find('span:lt(5)').remove();
    }

    // Now scroll to our new bottom
    $console.scrollTop($console[0].scrollHeight - $console.height());
  };

  // Allow us to open some links in our regular browser
  jQuery('body').on('click', 'a[target="_blank"]', function(){
    gui.Shell.openExternal( this.href );
    return false;
  });

  var nordnetLogin = function() {
    var username = jQuery('.login-form input[name=username]').val();
    var password = jQuery('.login-form input[name=password]').val();

    var $btn = jQuery('.login-form .submit-btn');


    if(!username.length || !password.length)
    {
      log('You have to enter both username and password before proceeding!', true);

      return;
    }

    log('Starting login procedure', true);

    // Start by animating the form to show that we're actually doing something
    $btn.removeClass('submit-btn')
      .removeClass('btn-primary')
      .removeClass('btn-embossed')
      .addClass('btn-info')
      .text('Logging in..');
    var resetBtn = function(){
      $btn.addClass('submit-btn')
        .removeClass('btn-info')
        .addClass('btn-primary')
        .addClass('btn-embossed')
        .text('Log in with Nordnet');
    }

    // load the nordnet login page so that we are assigned a session ID and can extract the form elements
    var nordnetLoginPageURL = 'https://www.nordnet.se/mux/login/startSE.html';
    request(nordnetLoginPageURL, function (error, response, loginBody) {
      if (!error && response.statusCode == 200) {
        var $remoteLoginForm = jQuery('#loginForm', loginBody);

        // Fill in our credentials
        $remoteLoginForm.find('#input1').val(username);
        $remoteLoginForm.find('#pContent').val(password);

        // Nordnet likes to encrypt the password (in the BROWSER, rofl) before
        // sending it over an encrypted connection, so lets humor them.
        // If you're wondering why this is a bad (or at the very least, redundant)
        // idea, read this short blog entry along with its comments:
        // https://web.archive.org/web/20091216114817/http://chargen.matasano.com/chargen/2006/4/28/oh-meebo.html
        if ($remoteLoginForm.find('input[name=encryption]').val() != 0) {
          // We'll need our session ID for this bit. We should have a cookie
          // called LOL (yes, really) that we can inspect for that purpose.
          log('Extracting session ID', true);
          var cookies = cookiejar.getCookies(nordnetLoginPageURL);
          var sessioncookie = false;
          for (var i=0; i < cookies.length; i++) {
            if (cookies[i].key === 'LOL') {
              sessioncookie = cookies[i];
              break;
            }
          }
          if(!sessioncookie)
          {
            log('Couldnt find session cookie!', true);
            resetBtn();
            return;
          }
          var sessionid = sessioncookie.value;

          log('Encrypting password', true);
          var pubkey = '-----BEGIN PUBLIC KEY-----MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAK/Txi4bC8W1mLEYemVq9iDBAbWYGadzdsUfPolpBk0QEBy4WR3n1NFgF5R0nqb4hwO2NeaXQ3KliMqOVKDpqqcCAwEAAQ==-----END PUBLIC KEY-----';
  				var pubkeyObj = RSA.getPublicKey(pubkey);
  				$remoteLoginForm.find('#pContHidden').val(
            RSA.encrypt($remoteLoginForm.find('#pContent').val(), pubkeyObj, sessionid)
          );
  			}
        else
        {
          // I've never seen this scenario in the wild but I imagine this is how
          // they want it to be, since the regular password field (#pContent)
          // doesnt have a "name" attribute and wouldnt be sent to the server.
          $remoteLoginForm.find('#pContHidden').val(password);
        }

        // This is hilarious, I know.
        var formPostData = querystring.parse($remoteLoginForm.serialize());

        // submit the form with our usr and pwd
        request.post(
          {
            baseUrl: 'https://www.nordnet.se',
            url: $remoteLoginForm.attr('action'),
            form: formPostData
          },
          function(err, httpResponse, postResponseBody){
            if (!err && httpResponse.headers.location == '/mux/web/user/overview.html')
            {
              // We're in! Lets start our monitor on the news section
              log('Logged in!', true);

              jQuery('.login-form').hide();
              jQuery('.news').show();

              //TODO: populate a portfolios array so that refreshNews knows to rotate through them
              refreshNews();
            }
            else
            {
              log('Something went wrong while logging in', true);
              log(err);
              log(httpResponse);
              resetBtn();
            }
          }
        );
      }
      else
      {
        log('Something went wrong while logging in', true);
        log(error);
        log(response);
        resetBtn();
      }
    });
  };

  // Now bind some events to the login method
  jQuery('body').on('click', '.login-form .submit-btn', function(e){
    e.preventDefault();
    nordnetLogin();
  });
  jQuery('body').on('keyup', '.login-form input', function(e){
    if(e.keyCode == 13)
    {
      e.preventDefault();
      nordnetLogin();
    }
  });

  var refreshNews = function(){
    //TODO: Load the news page. On complete, set a timeout for loading it again (60 seconds seems like a reasonable wait)
    var dayCount = 1;
    var nordnetNewsUrl = 'https://www.nordnet.se/mux/web/analys/nyheter/nyheterPressmeddelanden.html?omxnews=on&direkt=on&tddelayed=on&ob=on&arvopaperi=on&ddk=on&aktiefokus=on&hugin=on&wkr=on&ngn=on&atorg=on&beq=on&filtrering=mydepot&fritext=&day_count='+dayCount+'&sentform=1';
    request({
      url: nordnetNewsUrl,
      encoding: 'binary' // A weird NodeJS name for latin1 (aka ISO-8859-1, which Nordnet insists on)
    }, function (error, response, newsBody) {
      if (!error && response.statusCode == 200)
      {
        var $rows = jQuery('a.news', newsBody).closest('tr');
        $rows.each(function(i, v){
          var $row = jQuery(v);

          // Extract source and ID so we can construct a permalink
          var keyExtract = $row.find('a').attr('onclick').match('this,\'(.*)\',\'(.*)\'');

          var newsEntry = {
            source: keyExtract[2],
            id: keyExtract[1], // The ID at the source, not the entry ID
            title: $row.find('a').text(),
            url: 'https://www.nordnet.se/mux/web/analys/nyheter/visaNyhet.html?itemid='+keyExtract[1]+'&sourcecode='+keyExtract[2],
            publishedAt: $row.find('.time').text(),
            printed: false,
            notified: false,
            read: false
          };
          // Set a unique ID on this thing
          newsEntry.key = `nordnet_${newsEntry.source}_${newsEntry.id}`;

          if(printedNews.indexOf(newsEntry.key) === -1)
          {
            // Add link to list
            jQuery('.news-items ul').prepend('<li><a href="'+newsEntry.url+'" target="_blank" data-entry="'+newsEntry.key+'">'+newsEntry.title+'</a></li>');
            // Mark as printed
            printedNews.push(newsEntry.key);
            newsEntry.printed = true;
          }

          // Notify and save "read" state for new entries
          if(readNews.indexOf(newsEntry.key) === -1)
          {
            // Show a notification
            var notification = new Notification('Nordnet', {
              icon: 'img/logo4.png',
              body: newsEntry.title
            });
            notification.addEventListener('click', function() {
              gui.Shell.openExternal(newsEntry.url);
              newsEntry.read = true;
              notification.close();
            });
            newsEntry.notified = true;

            // Log it
            log(newsEntry);

            // Mark as read
            readNews.push(newsEntry.key);
            localStorage.setItem('readNews', JSON.stringify(readNews));
          }
        });
      }
      else
      {
        log('Something went wrong while refreshing news feed', true);
        // Logged out maybe? idk & idc.
        console.log(error);
        console.log(response);
        console.log(newsBody);
      }
      setTimeout(function(){ refreshNews(); }, 60000);
    });
  };
});
