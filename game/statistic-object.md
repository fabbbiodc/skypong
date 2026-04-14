```
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
```

```
const res = await fetch(
'${STATS_SERVICE_URL}/internal/statistics/gameresult/update',
{
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Authorization': Bearer ${SERVICE_TOKEN},
'X-Service-Name': 'game-service'
},
body: JSON.stringify({
game_id: gameId,
start_at,
end_at,
players: [
{
user_id: p1.id,
user_score: p1.score,
user_result: p1.result
},
{
user_id: p2.id,
user_score: p2.score,
user_result: p2.result
}
]
})
}
);
```
