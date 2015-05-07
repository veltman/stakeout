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
function email(options,key) {

  if (!key) {
    throw "Mailgun API key required."
  }

  // Is there any benefit from caching this? What is JavaScript?
  mg = mg || new Mailgun(key);

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
function slack(options,token) {

  if (!token) {
    throw "Slack webhook token required."
  }

  var payload = {
    "channel": options.channel,
    "username": options.username,
    "icon_emoji": options.icon,
    "text": options.text
  };

  // TODO: configure URL elsewhere
  request.post(
    {
      url: "https://" + options.subdomain + ".slack.com/services/hooks/incoming-webhook?token=" + token,
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