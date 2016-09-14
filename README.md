# Nordnet News Parser

![Screenshot](http://i.imgur.com/T8vfQwT.png)

This is pretty much a hack that I threw together for myself and I don't expect it to work for long, but since it involves bank accounts I thought it'd be a good idea to keep it open source.

Want the ready-to-use version? Check out [Releases](https://github.com/Sleavely/nw-nordnet-news/releases).

## How it works

The app logs in as you on Nordnet and then once per minute it refreshes the "[press releases](https://www.nordnet.se/mux/web/analys/nyheter/nyheterPressmeddelanden.html)" page with a filter for your portfolio only. When an unread news item appears you'll receive a desktop notification.

## Privacy

I like money. You like money. Nobody likes getting hacked; That's why the only data that is saved by the app is which news items it has already shown you. The only site the app communicates with is Nordnet.

## License

The MIT License (MIT)  
Copyright (c) 2016 Joakim Hedlund

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
