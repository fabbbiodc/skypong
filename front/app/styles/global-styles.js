
export const buttons = {
    primary: "text-md ",
}

export const pills = {

}

export const texts = {
    primary: "text-base md:text-lg lg:text-xl"

}

/**
 * import {buttons} from 'global-syles' 
 * <BasicButton onclick={clicked} styles={isActive ? buttons.primary : buttons.primaryUnactive} />
 * 
 */

export function BasicButton ({styles, children, onClick, onHover, onSubmit})
{
    return(
        <>
        <Link href={} onClick={onClick} onSubmit={onSubmit}>
        {children}
        </Link>
        </>
    );
}


/*
<BasicButton>
    <i className="fa-arrorw"></>
    <span className={hilightBtn}>
        {t.play.title}
    </span>
</BasicButton>

*/