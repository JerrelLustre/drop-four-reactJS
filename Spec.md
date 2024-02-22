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