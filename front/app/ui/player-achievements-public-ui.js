import { getCurrentLocale } from "../lib/i18n/locale-manager";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "../hooks/use-translation";
/*
Achievement object structure:
  {
    id: 2, 
    key: 'achivements.winAchievements.win10Games', 
    nameKey: 'achivements.winAchievements.win10Games', 
    descriptionKey: 'achivements.winAchievements.win10GamesDesc',
    logoURL: '/assets/achivements/win10Games.png',
    requirement: 10,
  },
*/

function activateAchievements(achievements, wins, loses) {}
export default function PlayerAchievementsPublicUI({ achievements }) {
  const { t } = useTranslation();
  return (
    <article className="player-achievements-public-ui">
      <h3>{t.achievements.title}</h3>
      {/* {console.log(achievements)}*/}
      <div className="achievments-wrapper">
        {achievements.map((element) => {
          // console.log("Achievement:", element);
          return (
            <div className="achievement" key={element.id ?? element.nameKey}>
              <h4 className="achievement-title">{t[element.nameKey]}</h4>
              <p className="achievement-description">
                {t[element.descriptionKey]}
              </p>
              <div className="achievement-icon">
                <img
                  src={element.placeholderUrl}
                  alt={t[element.descriptionKey]}
                />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
