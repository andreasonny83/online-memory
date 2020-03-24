const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');
const AWS = require('aws-sdk');
const REGION = process.env.REGION || 'us-east-1';
const TABLE_NAME = process.env.TABLE_NAME || '';

AWS.config.update({
  region: REGION,
});

const docClient = new AWS.DynamoDB.DocumentClient();

const randomNameConfig = {
  dictionaries: [adjectives, colors, animals],
  length: 3,
  separator: '_',
  style: 'lowerCase',
};

const doesItemExist = data => {
  if (data && data.Items && data.Count && data.Count > 0 && data.Items.length && data.Items[0]) {
    return data.Items[0];
  }

  return undefined;
};

const findItem = async (tableName, itemId) => {
  const params = {
    TableName: tableName,
    KeyConditionExpression: '#id = :id',
    ExpressionAttributeNames: {
      '#id': 'id',
    },
    ExpressionAttributeValues: {
      ':id': itemId,
    },
  };

  return docClient.query(params).promise();
};

const generateUniqueName = async tableName => {
  const randomName = async (fileName, iteration = 1) => {
    if (iteration > 3) {
      return null;
    }

    let itemData;
    try {
      itemData = await findItem(tableName, fileName);
    } catch (err) {
      console.log(err);
      return null;
    }

    if (doesItemExist(itemData)) {
      const newFileName = uniqueNamesGenerator(randomNameConfig);
      return randomName(newFileName, iteration + 1);
    }
    return fileName;
  };

  return randomName(uniqueNamesGenerator(randomNameConfig));
};

exports.graphqlHandler = async (event, context, callback) => {
  const { field, owner, input } = event;

  switch (field) {
    case 'createGame': {
      const { name, size, players } = input;

      const gamePlayers = players
        .filter(player => player.active)
        .map((player, index) => ({
          id: index + 1,
          name: player.name,
        }));
      const randomName = await generateUniqueName(TABLE_NAME);
      const createdAt = new Date().toISOString();
      const values = {
        __typename: 'Game',
        users: [owner],
        createdAt,
        teams: size,
        players: gamePlayers,
        playerTurn: gamePlayers[0],
        name,
        owner,
      };

      console.log('values', values);

      if (randomName) {
        callback(null, { id: randomName, values });
      } else {
        callback(null, { error: 'Cannot find an available game name' });
      }

      break;
    }
    case 'claimPlayer': {
      console.log('event', event);
      const { input, userId } = event;
      const { gameId, playerId } = input;
      const gameData = await findItem(TABLE_NAME, gameId);
      const gameExists = doesItemExist(gameData);

      if (!gameExists) {
        callback(null, { error: `Game ${gameId} does not exist` });
      }

      const gameDataItem = gameData.Items[0];
      const players = (gameDataItem && gameDataItem.players) || [];

      const playersUpdated = players.map(player => {
        if (`${player.id}` === `${playerId}`) {
          return {
            ...player,
            userId,
          };
        }
        return player;
      });

      const values = {
        players: playersUpdated,
      };

      console.log('values', values);

      callback(null, { id: gameId, values });

      break;
    }

    default: {
      callback(null, { error: `Unknown field, unable to resolve ${event.field}` });
      break;
    }
  }
};
