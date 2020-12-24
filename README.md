# Jeeves
*You rang, sir?*

Jeeves is a discord bot that scrapes for video uploads from your favorite Youtube channels. Why wait for an annoying email notificaion when your favorite robo-butler can issues a ping?

This is an early prototype. Myself and [fkscott](https://github.com/fkscott) are currently working on a more effecient, and centralized version of this bot that utilizes Youtube API calls. While a web scraper is highly inefficient, this repo illustrates the concept we plan to implement.

At the moment, if you want to use jeeves you need to run `node jeeves.js` from the project folder, and add your own authentication in `auth.json`. Also, make sure you have the necessary dependencies installed. (e.g. discord.io, winston, puppeteer, etc.). 

## Dependicies
1. discord.io
2. winston
3. puppeteer
4. node.js

## Supported Commands
`?ping` - pings bot

`?default` - sets default channel

`?add` - adds a youtube channel (use the `/videos` page url)

`?channels` - displays channels

`?delete` - removes a channel based on its position (use ?channels to view)

`?checkDefault` - pings in default channel

`?scan` - manually check for uploads (this is an automatic process every 15 minutes)

`?scrape` - sends most recent video from youtube channel (use the `/videos` page url)


## Extra Commands 
`?judge` - is something based or cringe? Let Jeeves decide

`?dec2hex` - convert a decimal number to hexadecimal

`?hex2dec` - convert a hexadecimal number to decimal

`?bin2dec` - convert a binary number to decimal

`?dec2bin` - convert a decimal number to binary
	