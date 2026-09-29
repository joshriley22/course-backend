Welcome to UVA Course Search!

The backend is mostly a database access layer, all of which was coded by me. I also wrote the scripts which populate the database based on the UVA SIS API and the UVA courses website.

For the frontend, I created the base for each page. This means I created the card template, the carousel, and everything involved with the ReactFlow graph (short of some of the d3-force simulation). After the base elements were created, I used Cluade with impeccable to fully flesh out the pages.

To do:
- Implement a find-union data structure to prevent node crowding
- Make it clear that the initial state is a Guest Account, probably going to be a small pop-up
