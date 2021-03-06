/**
 * Schema定义
 */
import {
    Game,
    HidingSpot,
    checkHidingSpotForTreasure,
    getGame,
    getHidingSpot,
    getHidingSpots,
    getTurnsRemaining,
} from './database';

import {
    nodeDefinitions,
    globalIdField,
    fromGlobalId
} from 'graphql-relay/lib/node/node';

import {
    connectionDefinitions,
    connectionArgs
} from 'graphql-relay/lib/connection/connection';

import connectionFromArray from 'graphql-relay/lib/connection/arrayconnection';

import mutationWithClientMutationId from 'graphql-relay/lib/mutation/mutation';

import {
    GraphQLObjectType,
    GraphQLNonNull
} from 'graphql/type/definition';

import {
    GraphQLBoolean,
    GraphQLInt,
    GraphQLID
} from 'graphql/type/scalars';

import GraphQLSchema from 'graphql/type/schema';


/**
 * 配置NodeInterface 和 NodeField
 * 我们需要为Relay提供一个从对象映射到与该对象关联的GraphQL对象的方式
 * @type {*|{nodeInterface, nodeField}}
 */
var {nodeInterface, nodeField} = nodeDefinitions(
    (globalId) => {
        var {type, id} = fromGlobalId(globalId);
        if (type === 'Game') {
            return getGame(id);
        } else if (type === 'HidingSpot') {
            return getHidingSpot(id);
        } else {
            return null;
        }
    },
    (obj) => {
        if (obj instanceof Game) {
            return gameType;
        } else if (obj instanceof HidingSpot) {
            return hidingSpotType;
        } else {
            return null;
        }
    }
);

/***************** 美丽的分割线 *******************/

/**
 * 定义数据结构 GraphQLObjectType
 */
var gameType = new GraphQLObjectType({
    name: 'Game',
    description: 'A treasure search game',
    fields: () => ({
        id: globalIdField('Game'),
        hidingSpots: {
            type: hidingSpotConnection,
            description: 'Places where treasure might be hidden',
            args: connectionArgs,
            resolve: (game, args) => connectionFromArray(getHidingSpots(), args),
        },
        turnsRemaining: {
            type: GraphQLInt,
            description: 'The number of turns a player has left to find the treasure',
            resolve: () => getTurnsRemaining(),
        },
    }),
    interfaces: [nodeInterface],
});

var hidingSpotType = new GraphQLObjectType({
    name: 'HidingSpot',
    description: 'A place where you might find treasure',
    fields: () => ({
        id: globalIdField('HidingSpot'),
        hasBeenChecked: {
            type: GraphQLBoolean,
            description: 'True if this spot has already been checked for treasure',
            resolve: (hidingSpot) => hidingSpot.hasBeenChecked,
        },
        hasTreasure: {
            type: GraphQLBoolean,
            description: 'True if this hiding spot holds treasure',
            resolve: (hidingSpot) => {
                if (hidingSpot.hasBeenChecked) {
                    return hidingSpot.hasTreasure;
                } else {
                    return null;  // Shh... it's a secret!
                }
            },
        },
    }),
    interfaces: [nodeInterface],
});

/***************** 美丽的分割线 *******************/

var {connectionType: hidingSpotConnection} =
    connectionDefinitions({name: 'HidingSpot', nodeType: hidingSpotType});


/***************** 美丽的分割线 *******************/

/**
 * Query定义
 */
var queryType = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
        node: nodeField,
        game: {
            type: gameType,
            resolve: () => getGame()
        },
    }),
});

/***************** 美丽的分割线 *******************/


var CheckHidingSpotForTreasureMutation = mutationWithClientMutationId({
    name: 'CheckHidingSpotForTreasure',
    inputFields: {
        id: {type: new GraphQLNonNull(GraphQLID)},
    },
    outputFields: {
        hidingSpot: {
            type: hidingSpotType,
            resolve: ({localHidingSpotId}) => getHidingSpot(localHidingSpotId),
        },
        game: {
            type: gameType,
            resolve: () => getGame(),
        },
    },
    mutateAndGetPayload: ({id}) => {
        var localHidingSpotId = fromGlobalId(id).id;
        checkHidingSpotForTreasure(localHidingSpotId);
        return {localHidingSpotId};
    },
});

/***************** 美丽的分割线 *******************/

/**
 * Mutation定义
 */
var mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
        checkHidingSpotForTreasure: CheckHidingSpotForTreasureMutation,
    }),
});

/***************** 美丽的分割线 *******************/

/**
 * 总体Schema定义
 */
export var Schema = new GraphQLSchema({
    query: queryType,
    mutation: mutationType
});