//todo array of channels to check, peridoic interval, send video when scraped data is different than stored (i.e. a new video)

var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
const puppeteer = require('puppeteer');
const fs = require('fs');
const fsPromises = fs.promises;
const channels = require('./channels.json');
const defaultChannel = require('./defaultChannelID.txt');
//defaultChannelID = fs.readFileSync("./defaultChannelID.txt") | gotta use the fs. method

//Define scrapePage | types: [0: return], [1: sendMessage], [2: addChannel]
  async function scrapePage(url, type, channelID){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    //mrt: Most Recent Title
    /*const [mrt] = await page.$x('//*[@id="video-title"]'); // '[] =' returns first element in array
    const title = await mrt.getProperty('title');
    const titleTxt = await title.jsonValue();
    */
    var nameTxt = 'nameTxt';
    if(type === 2){
      //cne: Channel Name Element
      const [cne] = await page.$x('//*[@id="channel-name"]/div/div/yt-formatted-string'); // '[] =' returns first element in array
      const cname = await cne.getProperty('textContent');
      nameTxt = await cname.jsonValue();
    }
    //mrl: Most Recent Link
    const [mrl] = await page.$x('//*[@id="thumbnail"]'); // '[] =' returns first element in array
    const href = await mrl.getProperty('href');
    const hrefTxt = await href.jsonValue();

    //console.log({titleTxt}); //{} displays as JSON in console | title -> { titleTxt: "title" }
    //console.log({nameTxt});
    //console.log({hrefTxt});

    browser.close();

    switch(type){
      case(0):
        return hrefTxt;
      break;
      case(1):
        bot.sendMessage({
            to: channelID,
            message: hrefTxt
        });
      break;
      case(2):
        if(await addPage(url, nameTxt, hrefTxt)){
          bot.sendMessage({
              to: channelID,
              message: "Success"
          });
        }
      break;
    }

  }

  /*function runChecks(mins){
    checkInterval = setInterval( function(){
      checkUploads(fs.readFileSync("./defaultChannelID.txt"));
    }, mins * 60000);
  }*/

  async function checkUploads(channelID){
    console.log(" " + new Date() + "\n--Starting Upload Check--\n[");
    const data = await fsPromises.readFile("channels.json");
    // Converting to JSON
    const str = JSON.parse(data);
    //console.log(str);
    //console.log(str.length);
    //const newestVid = await scrapePage(String(str[i].page), 0, channelID);
    for(let i = 0; i < str.length; i++){
      const newestVid = await scrapePage(String(str[i].page), 0, channelID);
      console.log("  %s:\t%s", String(str[i].name) ,String(newestVid));
      if(newestVid != str[i].vid){
        //CHANGE vid value
        str[i].vid = newestVid;
        var jsonString = JSON.stringify(str, null, 2);
        console.log("!!! - New Upload - !!!");
        fs.writeFile("channels.json", jsonString, err => {
          if (err) throw err;
          console.log("Done writing"); // Success
        });

        bot.sendMessage({
            to: channelID,
            message: "New Upload from " + str[i].name + "!\n"+newestVid
        });
      }

    }
    console.log("]\n--Upload Check Complete--");
    /*const newestVid = await scrapePage(String(str[0].page), 0, channelID);
    console.log(newestVid);*/
  }

  async function addPage(myPage, myName, myVid){
    //READ JSON

    let newChannel = {
      page: myPage,
      name: myName,
      vid: myVid
    }

    channels.push(newChannel);

    var jsonString = JSON.stringify(channels, null, 2);

    fs.writeFile("channels.json", jsonString, err => {
      if (err) throw err;
      console.log("Done writing"); // Success
    });

    return true;
  }

  function removePage(id, channelID){
    channels.splice(id, 1);
    var jsonString = JSON.stringify(channels, null, 2);

    fs.writeFile("channels.json", jsonString, err => {
      if (err) throw err;
      console.log("Done writing"); // Success
    });

    bot.sendMessage({
        to: channelID,
        message: "Done!"
    });

    return true;
  }

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

//-----------------------------------------------------------------------------
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
    console.log("\n  !!! CONNECTED: " + new Date() + "\n");
    //checkUploads(fs.readFileSync("./defaultChannelID.txt"));
    //Check for uploads every "mins" minutes (global checkInterval variable)
    //runChecks(15);
    var mins = 15;
    checkInterval = setInterval( function(){
      checkUploads(fs.readFileSync("./defaultChannelID.txt"));
    }, mins * 60000);
});

//-----------------------------------------------------------------------------
bot.on('disconnect', function() {
  clearInterval(checkInterval);
  console.log("\n  !!! DISCONNECTED: " + new Date() + "\n");
  bot.connect();
  //console.log("\n  !!! RECONNECTING: " + new Date() + "\n");
});
//-----------------------------------------------------------------------------
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `?`
    if (message.substring(0, 1) == '?') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);
        switch(cmd) {
          // ?ping
          case 'ping':
    			case 'hello':
    			case 'jeeves':
    			case 'Jeeves':
              bot.sendMessage({
                  to: channelID,
                  message: 'You rang, sir?'
              });
          break;
          case 'help':
            bot.sendMessage({
              to: channelID,
              message: `\`\`\`

| ?ping             Sends back a simple message to check connectivity
| ?default          Sets discord channel as default for notifications
| ?checkDefault     Prints a message in the default discord channel
| ?scan             Manually checks for uploads
| ?add              Adds a YouTube channel to check videos
| ?channels         Shows the current list of followed channels
| ?delete           Removes the specified channel from the list
| ?judge            Checks if something is based or cringe
| ?dec2hex          Converts decimal number to hexadecimal
| ?dec2bin          Converts decimal number to bin\`\`\``
          });
          break;
          case 'default':
            console.log(channelID);
            fs.writeFile("defaultChannelID.txt", channelID, err => {
              if (err){
                throw err;
                bot.sendMessage({
                    to: channelID,
                    message: 'An error has occured'
                });
              }else{
                console.log("Defualt Channel set to " + channelID); // Success
                bot.sendMessage({
                    to: channelID,
                    message: 'This channel has been set as default'
                });
              }
            });
          break;
          case 'checkDefault':
            console.log(fs.readFileSync("./defaultChannelID.txt"));
            bot.sendMessage({
                to: fs.readFileSync("./defaultChannelID.txt"),
                message: 'Jeeves, Online!'
            });
          break;
    			/*case 'dunkey':
    				bot.sendMessage({
    					to: channelID,
    					message: 'https://www.youtube.com/watch?v=BCd7ZCN5uhk'
    				});
    			break;
    			case 'truth':
    				bot.sendMessage({
                to: channelID,
                message: 'https://i.kym-cdn.com/entries/icons/facebook/000/032/725/cover1.jpg'
            });
    			break;
    			case 'kouga':
    				bot.sendMessage({
                to: channelID,
                message: 'https://i.chzbgr.com/full/7033051648/hE66116D2/break-dancing-gorilla'
            });
    			break;*/
    			case 'dec2hex':
    				var dec = parseInt(args[0]);
    				var hex = 0;
    				if (dec < 0)
    				{
    					hex = 0xFFFFFFFF + dec + 1;
    				}
    				else{
    					hex = dec;
    				}

    				hex = hex.toString(16).toUpperCase();

    				bot.sendMessage({
                to: channelID,
                message: hex
            });
    			break;
    			case 'hex2dec':
    				var hex = parseInt(args[0], 16);

    				dec = hex.toString(10).toUpperCase();

    				bot.sendMessage({
                to: channelID,
                message: dec
            });
    			break;
    			case 'dec2bin':
    				var dec = parseInt(args[0]);
    				var bin = 0;

    				bin = dec.toString(2).toUpperCase();

    				bot.sendMessage({
                to: channelID,
                message: bin
            });
    			break;
    			case 'bin2dec':
    				var bin = parseInt(args[0], 2);

    				dec = bin.toString(10).toUpperCase();

    				bot.sendMessage({
                to: channelID,
                message: dec
            });
    			break;
          case 'judge':
            if(Math.random() < 0.5){
              bot.sendMessage({
                  to: channelID,
                  message: ":regional_indicator_c: :regional_indicator_r: :regional_indicator_i: :regional_indicator_n: :regional_indicator_g: :regional_indicator_e:"
              });
            }else{
              bot.sendMessage({
                  to: channelID,
                  message: ":b: :a: :regional_indicator_s: :regional_indicator_e: :regional_indicator_d:"
              });
            }
          break;
          case 'check':
          case 'uploads':
          case 'run':
          case 'scan':
            bot.sendMessage({
              to: channelID,
              message: "Looking for uploads... (This process occurs in the background automatically)"
            });
            checkUploads(channelID);
          break;
          case 'scrape':
            console.log("Scraping...");
            console.log(args[0]);
            var match = /^(\s*https:\/\/www.youtube.com\/(user|c)\/).*(videos\s*)$/.test(args[0]);
            //regex looks for a youtube channel videos page
            console.log(match);
            if(match){
              scrapePage(args[0], 1, channelID);
              bot.sendMessage({
                  to: channelID,
                  message: "Scraping..."
              });
            }
            else{
              bot.sendMessage({
                  to: channelID,
                  message: "This does not appear to be a valid youtube page"
              });
            }
          break;
          case 'add':
            console.log("Adding Channel...");
            console.log(args[0]);
            var match = /^(\s*https:\/\/www.youtube.com\/(user|c|channel)\/).*(videos\s*)$/.test(args[0]);
            console.log(match);
            if(match){
              bot.sendMessage({
                  to: channelID,
                  message: "Adding..."
              });
              console.log("Valid...");
              scrapePage(args[0], 2, channelID);
            }
            else{
              console.log("Invalid");
              bot.sendMessage({
                  to: channelID,
                  message: "This does not appear to be a valid youtube page"
              });
            }
          break;
          case 'channels':
            fs.readFile("channels.json", function(err, data) {
              // Check for errors
              if (err) throw err;

              // Converting to JSON
              const str = JSON.parse(data);
              console.log(str);
              console.log(str.length);
              var msg = "```Channels:\n";
              for(var i = 0; i < str.length; i++){
                msg += "[" + i + "]\t" + str[i].name + "\t(" + str[i].page + ")";
                msg += "\n";
              }
              msg+= "```";
              bot.sendMessage({
                  to: channelID,
                  message: msg
              });
            });
          break;
          case 'delete':
          case 'remove':
            console.log("Removing Channel...");
            console.log(args[0]);
            fs.readFile("channels.json", function(err, data) {
              // Check for errors
              if (err) throw err;

              // Converting to JSON
              const str = JSON.parse(data);
              var match = /^(\s*\d+\s*)$/.test(args[0]);
              console.log(match);
              var id = parseInt(args[0]);
              if(id >= 0 && id < str.length){
                bot.sendMessage({
                    to: channelID,
                    message: "Removing..."
                });
                console.log("Valid...");
                removePage(id, channelID);
              }
              else{
                console.log("Invalid");
                bot.sendMessage({
                    to: channelID,
                    message: "Please use an applicable numeric value to indicate channel ID.\n(The \`?channels\` command shows IDs)"
                });
              }
            });
          break;
         }
     }
});
