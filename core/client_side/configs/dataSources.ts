'use strict';

const MILLISECONDS_PER_SECOND = 1000;
const BOT_FRAME_RATE = 60;
const CLIENT_FRAME_RATE = 60;


export const config = {
    services: [
        // {cls: InputController},
        // {cls: EventBus}
    ],

    dataSources: {
        bot: {
            velocity: 0.15,
            time: MILLISECONDS_PER_SECOND / BOT_FRAME_RATE
        },

        platform: {
            relativeDistance: 0.05,
            relativeLength: 0.3,
            aspectRatio: 0.25
        },

        game: {
            fieldSize: 100,
            playersNum: 4,
            time: MILLISECONDS_PER_SECOND / CLIENT_FRAME_RATE,
            fillFactor: 0.8,
            ballRelativeRadius: 0.05,
            ballVelocity: [0.00, 0.06],
            platformVelocity: 0.03,
            minimalOffset: 0.2,

            platformCollisionAccuracy: 1,
            sectorCollisionAccuracy: 0.5
        },

        network: {
            wsUrl: "ws://localhost:8080/api/user/game"
        }
    }
};
