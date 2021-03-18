
# gamebot

Quiz bot for Slack

## Run the project

- Clone the project.
- run `yarn` or `npm install`.
-  Create a new [slack app](https://api.slack.com/apps).
-  Copy `.env.example` in a new file `.env`.
	-  Copy  `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET` from the create slack app.
	-  Add backend uri in`MONGODB_URI`. 
	- Add a name for the command with which you want to run in `COMMAND_NAME`.
- Run `yarn dev`.
-  Expose your local server URL. We used [ngrok](https://ngrok.com/) for this.
- Add this URL in your apps needed features. (Interactivity & Shortcuts, Slash Commands and. Event Subscriptions)

## Commands

#### `/gamebot help` 
Lists out all the commands.
```
/gamebot create <gameName> <questionNos = 5> - create a new game

/gamebot edit <gameName> - edit existing game

/gamebot addQuestions <gameName> <questionNos = 1> - edit existing game

/gamebot start <gameName> - start the game

/gamebot stop <gameName> - stop the game

/gamebot pause <gameName> - pause the game

/gamebot resume <gameName> - resume the game

/gamebot restart <gameName> - restart the game

/gamebot list - list of all games

/gamebot help - list out the commands

/gamebot scoreboard <gameName> - see the scoreboard of the game

/gamebot myScore <gameName> - see your score for the game

```
#### `/gamebot list` 
List out all the created games.

#### `/gamebot create` 
Creates a new game.
| Parameters  | Type | Description  | optional |  default value| 
| :------------: |:-------:|:---------------:|:-------:|:--:|
| gameName| string | name of the game | false| - | 
| questionNos| number| number of questions to add|true | 5| 

#### `/gamebot edit` 
Edit the existing game.
| Parameters  | Type | Description  | optional |  default value| 
| :------------: |:-------:|:---------------:|:-------:|:--:|
| gameName| string | name of the game | false| - | 

#### `/gamebot addQuestions` 
Add questions in the existing game.
| Parameters  | Type | Description  | optional |  default value| 
| :------------: |:-------:|:---------------:|:-------:|:--:|
| gameName| string | name of the game | false| - | 
| questionNos| number| number of questions to add|true | 1| 

#### `/gamebot start` 
Start an existing game.
| Parameters  | Type | Description  | optional |  default value| 
| :------------: |:-------:|:---------------:|:-------:|:--:|
| gameName| string | name of the game | false| - | 

#### `/gamebot pause` 
Pause an existing game.
| Parameters  | Type | Description  | optional |  default value| 
| :------------: |:-------:|:---------------:|:-------:|:--:|
| gameName| string | name of the game | false| - | 


#### `/gamebot resume` 
Resume a paused game.
| Parameters  | Type | Description  | optional |  default value| 
| :------------: |:-------:|:---------------:|:-------:|:--:|
| gameName| string | name of the game | false| - | 

#### `/gamebot restart` 
Restart a game.
| Parameters  | Type | Description  | optional |  default value| 
| :------------: |:-------:|:---------------:|:-------:|:--:|
| gameName| string | name of the game | false| - | 


#### `/gamebot scoreboard` 
See the scoreboard of the game.
| Parameters  | Type | Description  | optional |  default value| 
| :------------: |:-------:|:---------------:|:-------:|:--:|
| gameName| string | name of the game | false| - | 


#### `/gamebot myScore` 
See your score for the game.
| Parameters  | Type | Description  | optional |  default value| 
| :------------: |:-------:|:---------------:|:-------:|:--:|
| gameName| string | name of the game | false| - | 


<video width="320" height="240" controls>
  <source src="gamebot.mp4" type="video/mp4">
</video>
