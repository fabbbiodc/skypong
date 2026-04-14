import { useTranslation } from "../hooks/use-translation";

export default function FooterTermsPolicy() {
  const { t } = useTranslation();
  return (
    <footer className="footer-terms-policy">
      <ul>
        <li>
          <a href="/privacy">{t.legal.privacy}</a>
        </li>
        <li>
          <a href="/terms">{t.legal.terms}</a>
        </li>
      </ul>
    </footer>
  );
}
