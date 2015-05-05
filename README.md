# Stakeout

For watching a set of URLs and notifying someone when something has changed.

## Install

```
npm install -g stakeout
```

## Commands

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

Run a task

```
stakeout run task-name
```

Run all the tasks

```
stakeout runall
```

## What is a task?

A task is a comparison function.  It should be a module that exports a single function like so:

```

module.exports = function compare(oldValue,callback) {

  // Figure out what the new value is
  // Figure out whether there's a notification to send (has something changed?)
  // Call the callback

};

```

The function will be passed the previous value for the task, and a callback function.  Once the task has figured out the new value and whether there's any notification text, it should call the callback.

A value can be anything that's JSON-serializable.  A string, a number, an array, a hashmaptionary, etc.

Here's an example task that checks to see if there are any new links on a page:

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

## Notes

Config for bots is stored as YAML in `~/.stakeout/config`.  You can edit it manually there.

To send email notifications, you need a `MAILGUN_API_KEY` environment variable.  To send Slack notifications, you need a `SLACK_TOKEN` environment variable.  You can also define either/both directly in the `config` file, e.g.:

```
SLACK_TOKEN: abc123
MAILGUN_API_KEY: def456
tasks:
  task-name:
    ...
```

## Why?

These sorts of "watch to see if a certain thing has happened/changed" bots can come in a lot of different flavors.  It's hard to abstract out the actual checking.  `stakeout` assumes that each bot will still need to be written by hand, but tries to abstract out the plumbing of keeping track of current values over time for comparison, and sending notifications.  It's probably overkill.


## To Do

* Make this handle the scheduling instead of requiring separate cronjobs per task
* Make the defaults in `notifier.js` configurable
* Add a `stakeout config` option
* Maybe queue the tasks with `runall` so that they don't step on each other
* Rewrite these docs more thoroughly
* Include some example bots