workerguide.transjournalists.org
======================================================

This news app is built on Chalkbeat's `interactive template <https://github.com/chalkbeat/interactive-template>`, which was then adapted to `styleguide.transjournalists.org`. Check the readme for that template for more details about the structure and mechanics of the app, as well as how to start your own project.

Getting started
---------------

To run this project you will need:

* Node installed (preferably with NVM or another version manager)
* The Grunt CLI (install globally with ``npm i -g grunt-cli``)
* Git

With those installed, you can then set the project up using your terminal:

#. Pull the code - ``git clone git@github.com:transja/workerguide.transjournalists.org``
#. Enter the project folder - ``cd workerguide.transjournalists.org``
#. Install dependencies from NPM - ``npm install``
#. Start the server - ``grunt``
#. To authenticate your user profile, copy ``auth.json`` from the TJA password vault and save it in the root directory as ``auth.json``

To refresh the text only
-------------
Note that the source document should be set to private unless actively building the site.

* Temporarily set the source document to be accessible by the build command
* Run ``grunt docs``
* Start the server to check the parser – ``grunt``
* Commit and push
* **Set the source document back to private**

Running tasks
-------------

Like all interactive-template projects, this application uses the Grunt task runner to handle various build steps and deployment processes. To see all tasks available, run ``grunt --help``. ``grunt`` by itself will run the "default" task, which processes data and starts the development server. However, you can also specify a list of steps as arguments to Grunt, and it will run those in sequence. For example, you can just update the JavaScript and CSS assets in the build folder by using ``grunt bundle less``.

Note that this repo will modify NPR's standard interactive-template project workflow to host on Github Pages instead of s3.

Common tasks that you may want to run include:

* ``sheets`` - updates local data from Google Sheets
* ``docs`` - updates local data from Google Docs
* ``google-auth`` - authenticates your account against Google for private files
* ``static`` - rebuilds files but doesn't start the dev server
* ``cron`` - runs builds and deploys on a timer (see ``tasks/cron.js`` for details)
* ``publish`` - uploads files to the staging S3 bucket

  * ``publish:live`` uploads to production
  * ``publish:simulated`` does a dry run of uploaded files and their compressed sizes

Hosting
---------------

Auth for TJA users
-------------
Create a file called ``auth.json`` in the project root folder using the shared credentials `Webmasters` vault.

Troubleshooting
---------------

**Fatal error: Port 35729 is already in use by another process.**

The live reload port is shared between this and other applications. If you're running another interactive-template project or Dailygraphics Next, they may collide. If that's the case, use ``--reload-port=XXXXX`` to set a different port for the live reload server. You can also specify a port for the webserver with ``--port=XXXX``, although the app will automatically find the first available port after 8000 for you.
