import sqlite3 from "sqlite3";
import { seedAuthUsers } from "./helpers/authSeed.js";
import { seedProfiles } from "./helpers/profileSeed.js";
import { seedGames } from "./helpers/statSeed.js";

const authDB = new sqlite3.Database("/auth-data/auth.db");
const profileDB = new sqlite3.Database("/profile-data/profile.db");
const statsDB = new sqlite3.Database("/stats-data/statistics.db");

(async () => {
  try {
    const users = await seedAuthUsers(authDB);
    await seedProfiles(profileDB, users);
    await seedGames(statsDB, users);

    console.log("✅ SEED COMPLETED");
    process.exit(0);
  } catch (e) {
    console.error("❌ SEED FAILED", e);
    process.exit(1);
  }
})();
