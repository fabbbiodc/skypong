import Fastify from 'fastify';
import chalk from 'chalk';
import { leaderboardLoop, getLeaderboardByIndex } from './workers/leaderboardWorker';
import { statisticsLoop } from './workers/statsWorker';
import { addGameStats, getGamesHistoryByUserId } from './gameresults';
import { initStatisticsDB, getStatisticsDB, closeStatisticsDB } from './database/dbStats';
import { initLeaderboardDB, getLeaderboardDB, closeLeaderboardDB } from './database/dbLeaderboard';
import * as StatsTypes from './types/stats.types';

// --- CONFIGURATION ---
const SERVICE_TOKEN = process.env.SERVICE_TOKEN!;

if (!process.env.SERVICE_TOKEN) {
    throw new Error("SERVICE_TOKEN env variable is required");
}

console.log("[stats] Auth service token:", SERVICE_TOKEN);

const fastify = Fastify({logger: true});

let server: typeof fastify;

fastify.register(require("fastify-metrics"), { endpoint: "/metrics" });

// --- SCHEMAS ---
const gameResultSchema = {
      	body: {
	    	type: 'object',
	    	required: ['game_id', 'start_at', 'end_at', 'players'],
	    	properties: {
		  	game_id: { type: 'string' },
		  	start_at: { type: 'string' },
		  	end_at: { type: 'string' },

		  	players: {
				type: 'array',
				minItems: 2,
				maxItems: 2,

				items: {
			      		type: 'object',
			      		required: ['user_id', 'user_score', 'user_result'],
					properties: {
				    		user_id: { type: 'string' },
				    		user_score: { type: 'number' },
				    		user_result: {
					  		type: 'string',
					  		enum: ['win', 'loss']
				    		}
			      		}
				}
		  	}
		}
      	}
};

// --- STATISTICS INTERNAL MIDDLEWARE ---
async function requireServiceAuth(req: any, reply: any) {

    const auth = req.headers.authorization;

    if (!auth) {
            return reply.status(401).send({ error: 'Missing auth' });
        }

        const token = auth.replace('Bearer ', '');

    if (token !== SERVICE_TOKEN) {
            return reply.status(403).send({ error: 'Forbidden' });
        }
}

// --- ADD GAME STATISTICS ---
fastify.post<{ Body: StatsTypes.GameResult; }>('/internal/statistics/gameresult/update', { preHandler: requireServiceAuth, schema: gameResultSchema }, async (req: any, reply) => {
	try {

	  	const {
			game_id,
			start_at,
			end_at,
			players
	  	} = req.body;


	  	if (players.length !== 2) {
	  		return reply.status(400).send({
	  			error: 'Game must have exactly 2 players'
	  		});
	  	}

	  	const [p1, p2] = players;

	  	req.log.info(
	  		{
	  			game_id,
	  			p1: p1.user_id,
	  			p2: p2.user_id
	  		},
	  		'Game result received'
	  	);

	  	await addGameStats(
	  		{
		  		game_id: game_id,
	  			start_at: start_at,
	  			end_at: end_at,

	  			players: [
	  				{
	  					user_id: p1.user_id,
	  					user_score: p1.user_score,
	  					user_result: p1.user_result
	  				},

	  				{
	  					user_id: p2.user_id,
	  					user_score: p2.user_score,
	  					user_result: p2.user_result
	  				}
	  			]
	  		});

	  	return reply.send({
  			status: 'ok'
		});

	} catch (err) {

    		req.log.error(err, 'Failed to process game result');   
    		return reply.status(500).send({
    			error: 'Internal error'
    		});
    	}
});

// --- GET LEADERBOARD --- 
fastify.get<{ Querystring: StatsTypes.LeaderboardQuery; }>('/statistics/leaderboard', async (req, reply) => {

	try {
	    	const by = (req.query.by as string) || 'rate';

	    	const limit = Number(req.query.limit ?? 50);
	    	const offset = Number(req.query.offset ?? 0);

	    	const data = await getLeaderboardByIndex(
		  	by as any,
		  	limit,
		  	offset
	    	);

	    	reply.send({ leaderboard: data });

      	} catch (err) {
		reply.status(400).send({
			error: 'Invalid leaderboard type',
		});
      	}
});

// --- GIVE ALL GAMES BY USER ID ---
fastify.get('/internal/statistics/games/history/:id', { preHandler: requireServiceAuth }, async (req: any, reply) => {
    try {
      const userId = req.params.id;

      const games = await getGamesHistoryByUserId(userId);

      return reply.send(games);

    } catch (err) {
      req.log.error(err, 'Failed to get games history');
      return reply.status(500).send({
        error: 'Internal error',
      });
    }
  }
);

// --- HEALTH CHECK ---
fastify.get("/healthz", async () => ({ ok: true, service: "statistics-service" }));

// --- START SERVER ---
async function start() {
      	console.log('[Main] starting service');

	const controller = new AbortController();
	const signal = controller.signal;

      	const shutdown = async () => {
	    	console.log('[Main] shutdown signal received');

	    	controller.abort();

	    	try {
			await closeStatisticsDB();
			console.log('[Main] Statistics DB closed');

		    	await closeLeaderboardDB();
			console.log('[Main] Leaderboard DB closed');

			await fastify.close();
			console.log('[Main] HTTP server closed');

	    	} catch (err) {
		  	console.error('[Main] fastify close error', err);
	    	}
      	};

      	process.on('SIGINT', shutdown);
      	process.on('SIGTERM', shutdown);

      	try {
	    	// --- INIT DB ---
		await initStatisticsDB();
	    	console.log(chalk.green.bold('Statistics DB initialized'));

	    	await initLeaderboardDB();
	    	console.log(chalk.green.bold('Leaderboard DB initialized'));

	    	// --- START WORKERS ---
		const statsWorker = statisticsLoop(signal, err => {
			console.error('[StatsWorker] error');
	    	});

	    	const leaderboardWorker = leaderboardLoop(signal, err => {
			console.error('[LeaderboardWorker] error');
	    	});

	    	console.log('[Main] workers started');

	    	// --- START SERVER ---
	    	console.log(fastify.printRoutes());
			await fastify.listen({ port: 6000, host: '0.0.0.0' });

	    	console.log(chalk.green.bold('Statistics service is running on :6000'));

	    	// --- WAIT WORKERS ---
	    	await Promise.allSettled([
		  	statsWorker,
		  	leaderboardWorker,
	    	]);

	    	console.log('[Main] all workers stopped');

	    	process.exit(0);

      	} catch (err) {
	    	console.error('[Main] fatal error', err);
	    	process.exit(1);
      	}
}

start();
