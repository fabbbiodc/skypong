import { v4 as uuid } from 'uuid';

export async function seedGames(db, users) {
  for (let i = 0; i < 100; i++) {
    const u1 = users[i % users.length].id;
    const u2 = users[(i + 1) % users.length].id;

    const [a, b] = [u1, u2].sort();
    const state = ['win', 'loss'];
    const points = [10, 5];
    const rand = Math.round(Math.random() * 1);
    const result = [ state[rand], state[(rand + 1) % 2]];
    const resPoints = [points[rand], points[(rand + 1) % 2]];
    await run(
      db,
      `INSERT OR IGNORE INTO games_and_results (
        game_id,
        user1_id,
        user2_id,
        user1_score,
        user2_score,
        user1_result,
        user2_result,
        start_at,
        end_at,
        processed,
        game_mode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, 'remote-pvp')`,
      [
        uuid(),
        a,
        b,
        resPoints[0],
        resPoints[1],
        result[0],
        result[1]
      ]
    );
  }

  // One game between AI and second user to check the things
  const aiUserId = 'ai-easy';
  const secondUserId = users[1].id; 
 
  
  //const secondUserId = users[Math.floor(Math.random() * users.length)].id;

  await run(
    db,
    `INSERT OR IGNORE INTO games_and_results (
      game_id,
      user1_id,
      user2_id,
      user1_score,
      user2_score,
      user1_result,
      user2_result,
      start_at,
      end_at,
      processed,
      game_mode
    ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, 'ai')`,
    [
      uuid(),
      aiUserId,
      secondUserId,
      1,
      3,
      'loss',
      'win'
    ]
  );
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) =>
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      if (this.changes === 0) console.log('⚠️  Game record exists, skipped:', params);
      else console.log('✅ Game inserted:', params);
      resolve();
    })
  );
}
