import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="container mx-auto mt-5 flex flex-col items-center gap-3 border-t py-6 md:flex-row md:justify-between md:gap-0">
      <p className="order-2 text-sm md:order-1">
        &copy; {`${currentYear} ${siteConfig.copyright}`}. All rights reserved.
      </p>
      <nav className="order-1 text-sm md:order-2" aria-label="quick links">
        <div className="flex justify-center gap-4">
          <Link href="/terms">Terms of Service</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </div>
      </nav>
    </footer>
  );
}
