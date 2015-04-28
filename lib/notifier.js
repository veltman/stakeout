// Hardcoded Data News defaults for now
// TO DO: make defaults configured elsewhere

// Dependencies
var request = require("request"),
    Mailgun = require("mailgun").Mailgun,
    mg;

/*

Send a plain-text email using the Mailgun API

Requires a MAILGUN_API_KEY environment variable.

notifier.email({
  from: "Someone <someone@someone.com>",
  to: "arecipient@domain.org",
  subject: "Hey",
  body: "What's up?"
});

Options:
from
subject
to (can be one recipient or an array)
body
silent (to fail silently, default false)


*/
function email(options) {

  if (!process.env.MAILGUN_API_KEY) {
    throw "MAILGUN_API_KEY environment variable not found."
  }

  // TODO: configure defaults elsewhere
  options.subject = options.subject || "Data News Notification";
  options.from = options.from || "'Data News Team' <wnyclabs@gmail.com>";

  // Is there any benefit from caching this? What is JavaScript?
  mg = mg || new Mailgun(process.env.MAILGUN_API_KEY);

  // Send it
  mg.sendText(
    options.from,
    options.to,
    options.subject,
    options.body,
    function(err) {

      if (!options.silent && err) {
        throw JSON.stringify(err,null,"  ");
      }

    }
  );

}

/*

Send a Slack message via incoming webhook.

Requires a SLACK_TOKEN environment variable.

notifier.slack({
  channel: "#general",
  emoji: ":tada:",
  username: "Confetti Bot",
  text: "HI EVERYONE!"
});

Options:
channel
emoji
username
text
silent (to fail silently, default false)


*/
function slack(options) {

  if (!process.env.SLACK_TOKEN) {
    throw "SLACK_TOKEN environment variable not found."
  }

  // TODO: configure defaults elsewhere
  options.channel = options.channel || "#notifications";
  options.emoji = options.emoji || ":robot:";
  options.username = options.username || "Data News Bot";

  var payload = {
    "channel": options.channel,
    "username": options.username,
    "icon_emoji": options.emoji,
    "text": options.text
  };

  // TODO: configure URL elsewhere
  request.post(
    {
      url: "https://datanews.slack.com/services/hooks/incoming-webhook?token=" + process.env.SLACK_TOKEN,
      body: payload,
      json: true
    },
    function(err,res,body){

      if (!options.silent) {

        if (err) {
          throw JSON.stringify(err,null,"  ");
        }

        if (res.statusCode !== 200) {
          throw "Status code: " + res.statusCode;
        }

      }

    }
  );

}

module.exports = {
  email: email,
  slack: slack
};