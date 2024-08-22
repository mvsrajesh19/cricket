const express = require('express')
const app = express()
app.use(express.json())
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')
const dbpath = path.join(__dirname, 'cricketTeam.db')
let db = null

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

const intialize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server starting at  http://localhost:3000/players/')
    })
  } catch (e) {
    console.log(e.message)
    process.exit(1)
  }
}
intialize()
app.get('/players/', async (request, response) => {
  const getquery = `
    SELECT
    * 
    FROM 
    cricket_team
  `
  const players = await db.all(getquery)
  response.send(
    players.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.post('/players/', async (request, response) => {
  const playerdetails = request.body
  const {player_id, player_name, jersey_number, role} = playerdetails
  const query = `
  INSERT INTO cricket_team("player_name","jersey_number","role")
  VALUES('${player_name}',${jersey_number},'${role}');
  `
  const a = await db.run(query)
  const player = a.lastID
  response.send('Player Added to Team')
})

app.get('/players/:player_id/', async (request, response) => {
  const {player_id} = request.params
  const query = `
  SELECT 
  * 
  FROM 
  cricket_team
  where player_id=${player_id};
  `
  const res = await db.get(query)
  const sres = convertDbObjectToResponseObject(res)
  response.send(sres)
})
app.put('/players/:player_id/', async (request, response) => {
  const {player_id} = request.params
  const details = request.body
  const {player_name, jersey_number, role} = details
  const query = `
  UPDATE
  cricket_team
  SET player_name='${player_name}',
  jersey_number=${jersey_number},
  role='${role}'
  WHERE 
  player_id=${player_id};
  `
  await db.run(query)
  response.send('Player Details Updated')
})
app.delete('/players/:player_id/', async (request, response) => {
  const {player_id} = request.params
  const query = `
  DELETE FROM 
  cricket_team
  WHERE
  player_id=${player_id};
  `
  await db.run(query)
  response.send('Player Removed')
})
module.exports = app
