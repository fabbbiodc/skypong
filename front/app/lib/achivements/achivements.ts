/* Achivements list
-- Example structure for translation files --
     achivements: {
        title: "Logros",
        winAchievements: {
            title: "Logros de Victoria",
            firstWin: "Primera Victoria",
            firstWinDesc: "Gana tu primer juego.",
            win10Games: "Competidor Consistente",
            win10GamesDesc: "Gana 10 juegos.",
            win100Games: "Maestro del Pong",
            win100GamesDesc: "Gana 100 juegos.",
        },
        logAchievements: {
            title: "Logros de Inicio de Sesión",
            firstLogin: "Nuevo Recluta",
            firstLoginDesc: "Inicia sesión por primera vez.",
            login7Days: "Asiduo",
            login7DaysDesc: "Inicia sesión durante 7 días consecutivos.",
            login30Days: "Veterano",
            login30DaysDesc: "Inicia sesión durante 30 días consecutivos.",
        },
        wonGamesAchievements: {
            title: "Logros de Juegos Ganados",
            firsgame: "Novato",
            firsgameDesc: "Gana tu primer juego.",
            win5Games: "Principiante",
            win5GamesDesc: "Gana 5 juegos.",
            win50Games: "Intermedio",
            win50GamesDesc: "Gana 50 juegos.",
            win500Games: "Experto",
            win500GamesDesc: "Gana 500 juegos.",
        },
    },
    
*/

import { platform } from "node:os";

/* Achivements list structure
  id: Unique identifier for the achievement
  key: Translation key for the achievement
  nameKey: Translation key for the achievement name
  descriptionKey: Translation key for the achievement description
  requirement: Numeric requirement to unlock the achievement        
*/
/* Usage example:
import achivements from 'path/to/achivements';

achivements.forEach(achivement => {
    console.log(l(achivement.nameKey)); // Localized name
    console.log(l(achivement.descriptionKey)); // Localized description
});
*/
const achivements = [
  {
    id: 1,
    key: "achievements.winAchievements.firstWin",
    nameKey: "achievements.winAchievements.firstWin",
    descriptionKey: "achievements.winAchievements.firstWinDesc",
    logoURL: "/assets/achievements/firstWin.png",
    placeholderUrl: "/assets/achievements/placeholder.png",
    requirement: 1,
  },
  {
    id: 2,
    key: "achievements.winAchievements.win10Games",
    nameKey: "achievements.winAchievements.win10Games",
    descriptionKey: "achivements.winAchievements.win10GamesDesc",
    logoURL: "/assets/achievements/win10Games.png",
    placeholderUrl: "/assets/achievements/placeholder.png",
    requirement: 10,
  },
  {
    id: 3,
    key: "achievements.winAchievements.win100Games",
    nameKey: "achievements.winAchievements.win100Games",
    descriptionKey: "achievements.winAchievements.win100GamesDesc",
    logoURL: "/assets/achievements/win100Games.png",
    placeholderUrl: "/assets/achievements/placeholder.png",
    requirement: 100,
  },
  {
    id: 4,
    key: "achievements.logAchievements.firstLogin",
    nameKey: "achievements.logAchievements.firstLogin",
    descriptionKey: "achievements.logAchievements.firstLoginDesc",
    logoURL: "/assets/achievements/firstLogin.png",
    placeholderUrl: "/assets/achievements/placeholder.png",
    requirement: 1,
  },
  {
    id: 5,
    key: "achievements.logAchievements.login7Days",
    nameKey: "achievements.logAchievements.login7Days",
    descriptionKey: "achievements.logAchievements.login7DaysDesc",
    logoURL: "/assets/achievements/login7Days.png",
    placeholderUrl: "/assets/achievements/placeholder.png",
    requirement: 7,
  },
  {
    id: 6,
    key: "achievements.logAchievements.login30Days",
    nameKey: "achievements.logAchievements.login30Days",
    descriptionKey: "achievements.logAchievements.login30DaysDesc",
    logoURL: "/assets/achievements/login30Days.png",
    placeholderUrl: "/assets/achievements/placeholder.png",
    requirement: 30,
  },
  {
    id: 7,
    key: "achievements.wonGamesAchievements.firsgame",
    nameKey: "achievements.wonGamesAchievements.firsgame",
    descriptionKey: "achievements.wonGamesAchievements.firsgameDesc",
    logoURL: "/assets/achievements/firsgame.png",
    placeholderUrl: "/assets/achievements/placeholder.png",
    requirement: 1,
  },
  {
    id: 8,
    key: "achievements.wonGamesAchievements.win5Games",
    nameKey: "achievements.wonGamesAchievements.win5Games",
    descriptionKey: "achievements.wonGamesAchievements.win5GamesDesc",
    logoURL: "/assets/achievements/win5Games.png",
    placeholderUrl: "/assets/achievements/placeholder.png",
    requirement: 5,
  },
  {
    id: 9,
    key: "achievements.wonGamesAchievements.win50Games",
    nameKey: "achievements.wonGamesAchievements.win50Games",
    descriptionKey: "achievements.wonGamesAchievements.win50GamesDesc",
    logoURL: "/assets/achievements/win50Games.png",
    placeholderUrl: "/assets/achievements/placeholder.png",
    requirement: 50,
  },
  {
    id: 10,
    key: "achievements.wonGamesAchievements.win500Games",
    nameKey: "achievements.wonGamesAchievements.win500Games",
    descriptionKey: "achievements.wonGamesAchievements.win500GamesDesc",
    logoURL: "/assets/achievements/win500Games.png",
    placeholderUrl: "/assets/achievements/placeholder.png",
    requirement: 500,
  },
];

export default achivements;
