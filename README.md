
# gamebot

Quiz bot for Slack

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
