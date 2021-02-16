# Online Board Games

This is the frontend repository for an online board game application. The frontend is made using Angular and associated libraries whilst the backend is made using Spring Boot.
The site allows players to compete online in games such as Chess, Shogi and Draughts/Checkers. Games are updated live using Websockets when the opposing player makes a move.

A demo of this application can be found here: https://abelshaw85.github.io/online-board-games/

## Installation

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
Note that the backend server is CORS protected, and so your local installation will likely not allow for server data to be sent and received. You will have to download the backend Spring Boot application and make modifications to both the frontend environment variables and the backend application.properties file.
If you wish to design your own backend, note that the app uses JWTs for authentication and to authorise Websocket connections. The designed backend stores users in an online database, but generates games in-memory. If you wish to persist games, you may want to create your own Game database and tables.

## Usage

Navigate to `http://localhost:4200/` to see the local version of the site. 

## Credits

For the most part the code is my own, though there are some exceptions when dealing with new concepts where the code is mostly unchanged:

* Java Guides: https://www.javaguides.net/2019/06/spring-boot-angular-8-websocket-example-tutorial.html was used heavily when creating the Websocket service.
* Java Brains: https://www.youtube.com/watch?v=X80nJ5T7YpE used for managing JWTs, mostly similar on the backend.
* Chess and Shogi svg files were taken from Wikipedia: https://en.wikipedia.org/
* Sounds used for victory/defeat are from ZapSplat: https://www.zapsplat.com/
