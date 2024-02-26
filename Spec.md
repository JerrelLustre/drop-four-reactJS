1. 7x6 board
2. Multiplayer support
3. GUI
4. Ability to play against a cpu


Day 1:

Building a GUI
-specify the rows and columns
-Generate two arrays, a 1d version and a 2d version of the board
-We need the 1d array to render divs for the board
-the 2d board will be used...


Notes: UX 
Outline where the piece will land
Outline the winning piece


import Peer from 'peerjs'


Player 1 places piece
Disable action, set myturn to false
game board and player state update
send game data to peer
setMyturn to true
Player 2 places piece


Issues:
Config connection so it work on firefox
Simplify user code


Todo:
<!-- Simplify user input code to 4-5 letters (Done) -->
<!-- Add Favicon (Done) -->
Add animation to coin drop 
<!-- Issue: Both users see the orange wave on initial launch -->
<!-- Add a replay button -->
Add error states
    When a player disconnectes: add a function that runs at the beginning of setpiece that checks if the connection is still valid
Add tie state
<!-- Change turn message to "Its Your Turn" and "Waiting for other player" (Done) -->
<!-- Add feedback for message copy (Done) -->
<!-- Add hover state to buttons (done) -->
<!-- Add click state to buttons (done) -->
<!-- Sort Code into components where possible -->
<!-- Incorrect usage for "label for" -->


Add animation to waves entering the screen (Low priority)


Lesson learned: if possible send flags to trigger processes on the user's end instead of processing data and then sending the data
Example: send flag to reset game instead of sending data of a reset game