# Ad Designer Challenge
Welcome to the challenge — we hope it's fun!

See the [README](https://github.com/LoKnow/ad_designer/blob/master/README.md) 
for steps on getting the base app up and running.  For your convenience, a
simple Node.js Web server project is provided for local development.  The app
is configured to connect to a test server to provide you with the sample data
you'll need to test your modified app.

Your challenge will be to update the JavaScript in this Vue app to improve the
ad designer user experience.

## Smooth ad refresh transition
Currently, each time a change is made to an aspect of the ad, the app will make
a request to the server to provide an updated preview in an iframe.  The
transition is somewhat jarring because the old preview disappears when the
iframe reloads.

A better user experience would be to:
- have the old preview remain visible until the new preview is available
- add a UI element to indicate that a refresh is in progress—perhaps a 
  semi-transparent overlay with an animated indicator.
- show the new preview when it is available (this can be approximate—we don't
  have a specific event for when the ad finishes rendering)

The starting technologies have been predetermined for this challenge, but you
are free to incorporate any new tools, libraries, or resources.

## Rubric
Submissions will be evaluated primarily on these criteria:

- Does it meet the basic requirements?
- How pleasant is the resulting UI within the range of functionality of the ad
  designer?
- Is the code well organized/factored, easy to read, and does it adhere to 
  framework and industry conventions?

Bonus points if you are able to automate testing of your new logic.