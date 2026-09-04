import Link from "next/link";

const QUICK_LINKS = [
  { label: "Our Story", href: "/about" },
  { label: "Atelier Process", href: "/atelier-process" },
  { label: "Size Guide", href: "/size-guide" },
  { label: "Care & Maintenance", href: "/care" },
  { label: "FAQ", href: "/faq" },
];

const CATEGORIES = [
  { label: "Men's Oxfords", href: "/products?category=mens-oxfords" },
  { label: "Men's Chelsea Boots", href: "/products?category=mens-chelsea-boots" },
  { label: "Women's Stilettos", href: "/products?category=womens-stilettos" },
  { label: "Women's Loafers", href: "/products?category=womens-loafers" },
  { label: "Exclusive Accoutrements", href: "/products?category=accessories" },
];

export default function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

  return (
    <footer className="bg-espresso text-beige">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-heading text-lg font-bold text-gold">LUXE SOLE</h3>
          <p className="mt-3 text-sm text-beige/70">
            Elevating the art of shoemaking with timeless, handcrafted designs.
            Each pair is meticulously constructed using heritage Italian
            techniques and the world&apos;s finest full-grain leathers.
          </p>
          <div className="mt-4 flex gap-4 text-beige/70">
            <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer">IG</a>
            <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer">FB</a>
            <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noreferrer">TW</a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-gold">
            Quick Links
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-beige/70">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-gold">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-gold">
            Categories
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-beige/70">
            {CATEGORIES.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-gold">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-gold">
            Contact Info
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-beige/70">
            <li>120 Heritage Way, Milan, Italy</li>
            <li>concierge@luxesole.com</li>
            {whatsappNumber && <li>{whatsappNumber}</li>}
          </ul>
          <div className="mt-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-l-md border-none bg-beige px-3 py-2 text-sm text-espresso focus:outline-none"
            />
            <button className="rounded-r-md bg-gold px-4 py-2 text-sm font-semibold text-espresso">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-beige/10 py-4 text-center text-xs text-beige/50">
        © {new Date().getFullYear()} LUXE SOLE. All rights reserved. Crafted for connoisseurs.
      </div>
    </footer>
  );
}