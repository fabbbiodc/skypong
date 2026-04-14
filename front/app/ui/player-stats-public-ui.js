import { useTranslation } from '../hooks/use-translation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlagCheckered } from '@fortawesome/free-solid-svg-icons/faFlagCheckered';
import { faExplosion } from '@fortawesome/free-solid-svg-icons/faExplosion';
import { faPercent } from '@fortawesome/free-solid-svg-icons/faPercent';

export default function PlayerStatsPublicUI( { wins, losses })
{
    const { t } = useTranslation();
    return (
        <article className="player-stats-public-ui">
            <ul>
                <li><FontAwesomeIcon icon={faFlagCheckered} />{t.player.wins}<span className="player-stats-value"> {wins}</span></li>
                <li><FontAwesomeIcon icon={faExplosion} />{t.player.losses}<span className="player-stats-value"> {losses}</span></li>
                <li><FontAwesomeIcon icon={faPercent} />{t.player.winRate}<span className="player-stats-value"> {wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0}%</span></li>
            </ul>
        </article>
    );
}