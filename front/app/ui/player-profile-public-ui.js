import { useTranslation } from "../hooks/use-translation";

export default function PlayerProfilePublicUI({ nickname, winphrase, avatarUrl, bio })
{
    const { t } = useTranslation();
    return (
        <article className="player-profile-public-ui">
            <div className='player-avatar'>
                <img src={avatarUrl} alt={bio} />
            </div>
            <div className='player-info'>
                <h2 className='player-nickname'>{ nickname}</h2>
                <h3 className='player-winphrase'> { winphrase }</h3>
                <p className='player-bio'>{bio}</p>
            </div>
        </article>
    );
}