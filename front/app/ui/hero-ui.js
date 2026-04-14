import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "../hooks/use-translation";
import Link from "next/link";

/**
 * Home hero section with the primary CTA to enter the unified play workflow.
 */
export default function HeroUI() {
  const { t } = useTranslation();
  return (
    <section className="hero-ui mb-8 flex flex-col items-center justify-center gap-8">
      <div className="hero-content">
        <h1 className="hero-title mb-4 text-center rainbowtext bolder text-9xl">SKYPONG</h1>
      </div>
      <div className="hero-image">
        <Link href="/play" aria-label="Play game" className="hero-icon">
          <FontAwesomeIcon icon={faPlay} />
        </Link>
      </div>
    </section>
  );
}
