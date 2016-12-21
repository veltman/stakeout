# Stakeout

For watching a set of URLs and notifying someone when something has changed.

## Step 1. Install Stakeout

```
npm install -g stakeout
```

## Step 2. Create a task

A task is a comparison function.  It should be a module that exports a single function like so:

```

module.exports = function compare(oldValue,callback) {

  // Figure out what the new value is
  // Figure out whether there's a notification to send (has something changed?)
  // Call the callback
  callback(err,newValue,notificationMessage);

};

```

The function will be passed the previous value for the task, and a callback function.  Once the task has figured out the new value and whether there's any notification text, it should call the callback.

A value can be anything that's JSON-serializable.  A string, a number, an array, a hashmaptionary, etc.

Here's a crude example task that checks to see if there are any new links on a page:

```

var request = require("request"),
    cheerio = require("cheerio");

module.exports = function compare(oldValue,callback) {

  request("http://www.somewebsite.com",function(err,response,body){

    if (err) {
      return callback(err);
    }

    // On the first run, oldValue will be undefined
    // Make sure to catch that
    if (!oldValue) {
      oldValue = [];
    }

    var links = [],
        newLinks = [],
        notificationText;

    cheerio.load(body)("a").each(function(){

      var url = $(this).attr("href");

      links.push(url);

      if (oldValue.indexOf(url) === -1) {
        newLinks.push(url);
      }

    });

    if (newLinks.length) {
      notificationText = "New links found: " + newLinks.join(", ");
    }

    callback(null,links,notificationText);

  });

};

```

The first argument to the callback is an error message.  If it's anything but falsey, the script will exit with an error.  The second argument is the new value to save (which will become the old value during the next run).  The third optional value is a notification message.  If it's not falsey, it will be sent to every email/Slack address that's watching the task.

## Step 3. Add the task to stakeout

```
stakeout add task-name -p /absolute/path/to/module
```

## Step 4. Add some people to be notified

Watchers can be email addresses, Slack usernames, or Slack channels.

```
stakeout watch task-name jane@doe.com,#notifications,@john
```

## Step 5. Create a cronjob for the task

To check every minute:

```
* * * * * stakeout run task-name
```

## Commands

Run a task

```
stakeout run task-name
```

Run all the tasks

```
stakeout runall
```

Create a new task (path is required, description is optional):

```
stakeout add task-name -p /absolute/path/to/bot -d "Description of this task"
```

Delete a task:

```
stakeout remove task-name
```

List existing tasks:

```
stakeout list
```

Rename a task:

```
stakeout rename old-name new-name
```

Add email notifications for someone:

```
stakeout watch task-name person@domain.com
```

Add Slack notifications for someone:

```
stakeout watch task-name @person
```

Remove notifications for someone:

```
stakeout unwatch task-name [person]
```

Set up options like API keys and email metadata:

```
stakeout config
```

Clean out stored data for a particular task:

```
stakeout clean task-name
```

Clean out all stored task data:

```
stakeout cleanall
```

## Notes

Config for bots is stored as YAML in `~/.stakeout/config`.  You can edit it manually there.

To send email notifications, you need to set a few options, especially a Mailgun API key.  To send Slack notifications, you need to set a few options, especially a Slack incoming webhook URL.  You can add these all using `stakeout config` or edit them manually in `~/.stakeout/config`:

```
SLACK_TOKEN: abc123
MAILGUN_API_KEY: def456
EMAIL_FROM: 'Data News Team <bots@wnyc.org>'
EMAIL_SUBJECT_PREFIX: 'Data News Bot: '
SLACK_NAME: Data News Bot
SLACK_ICON: ':robot:'
SLACK_WEBHOOK_URL: 'https://hooks.slack.com/services/ABC123...'
tasks:
  task-name:
    ...
```

The most recent value returned by a given task will be saved in `~/.stakeout/task-name.json`.

## Why?

These sorts of "watch to see if a certain thing has happened/changed" bots can come in a lot of different flavors.  It's hard to abstract out the actual checking.  `stakeout` assumes that each bot will still need to be written by hand, but tries to abstract out the plumbing of keeping track of current values over time for comparison, and sending notifications.  It's probably overkill.


## To Do

* Build in handler for "Have this URLs contents changed at all?"
* Make this handle the scheduling instead of requiring separate cronjobs per task
* Rewrite these docs more thoroughly
* Include some example bots