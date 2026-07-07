import Link from "next/link";
import CartBadge from "./CartBadge";

export default function Header() {
  return (
    <>
      <div className="topbar">
        <div className="container">
          <div className="topbar-left">
            <span>Free Shipping on orders above ₹999</span>
          </div>
          <div className="topbar-right">
            <Link href="/bulk">Bulk Orders</Link>
            <span>Corporate Gifting</span>
            <span>Need Help? +91 8069 750 293</span>
          </div>
        </div>
      </div>
      <header className="main">
        <div className="container">
          <Link href="/" className="logo">
            <span className="mark">Y</span>Yoode
          </Link>
          <nav className="primary">
            <ul className="menu">
              <li className="dropdown">
                <Link href="/shop">Products</Link>
                <ul className="submenu">
                  <li><Link href="/shop?cat=T-Shirts">T-Shirts</Link></li>
                  <li><Link href="/shop?cat=Drinkware">Mugs &amp; Bottles</Link></li>
                  <li><Link href="/shop?cat=Tech%20Accessories">Caps &amp; Accessories</Link></li>
                  <li><Link href="/shop">View All Products</Link></li>
                </ul>
              </li>

              <li className="dropdown">
                <Link href="/bulk">Solutions</Link>
                <ul className="submenu">
                  <li><Link href="/bulk">Corporate Gifts</Link></li>
                  <li><Link href="/shop?cat=Welcome%20Kits">Welcome Kits</Link></li>
                  <li><Link href="/bulk">Event Branding</Link></li>
                </ul>
              </li>

              <li className="dropdown">
                <Link href="/customizer">Customize</Link>
                <ul className="submenu">
                  <li><Link href="/customizer">Custom T-Shirt</Link></li>
                  <li><Link href="/customizer">Custom Mug</Link></li>
                  <li><Link href="/customizer">Custom Bottle</Link></li>
                </ul>
              </li>

              <li className="dropdown">
                <Link href="/bulk">Resources</Link>
                <ul className="submenu">
                  <li><Link href="/bulk">FAQ</Link></li>
                  <li><Link href="/bulk">Track Order</Link></li>
                </ul>
              </li>

              <li className="dropdown">
                <Link href="/bulk">Bulk Orders</Link>
                <ul className="submenu">
                  <li><Link href="/bulk">Corporate Orders</Link></li>
                  <li><Link href="/bulk">Event Orders</Link></li>
                </ul>
              </li>
            </ul>
          </nav>
          <div className="header-actions">
            <Link className="icon-btn" href="/admin" aria-label="Admin">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16181D" strokeWidth={1.7}>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
              </svg>
            </Link>
            <Link className="icon-btn" href="/cart" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16181D" strokeWidth={1.7}>
                <circle cx="9" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M1 1h3l2.4 13.2a2 2 0 002 1.8h9.2a2 2 0 002-1.7L21 6H5" />
              </svg>
              <CartBadge />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
