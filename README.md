Jeeves is a discord bot that scrapes for video uploads from your favorite youtube channels.

This is an early prototype, and me and *https://github.com/fkscott* are currently working on a more effecient, and centralized version. In the moment, if you want to use jeeves you need to run ```node jeeves.js``` from the project folder, and add your own authentication. Also make sure you have the necessary dependencies (e.g. discord.io, winston, puppeteer, etc.). This isn't ideal, but it is just a prototype - we're currently working on the follow-up.

Commands:
	?ping - pings bot
	?default - sets default channel
	?add - adds a youtube channel (use the `/videos` page url)
	?channels - displays channels
	?delete - removes a channel based on its position (use ?channels to view)
	?checkDefault - pings in default channel
	?scan - manually check for uploads (this is an automatic process every 15 minutes)
	?scrape - sends most recent video from youtube channel (use the `/videos` page url)


There are some other little commands for fun included as well:
	?judge - is something based or cringe? Let Jeeves decide
	?dec2hex - convert a decimal number to hexadecimal
	?hex2dec - convert a hexadecimal number to decimal
	?bin2dec - convert a binary number to decimal
	?dec2bin - convert a decimal number to binary
	