import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site">
      <div className="container">
        <div className="foot-grid">
          <div>
            <div className="logo" style={{ color: "#fff", marginBottom: 14 }}>
              <span className="mark">Y</span>Yoode
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 260 }}>
              Premium custom merchandise for brands, teams and events — design, customize and deliver delight.
            </p>
          </div>
          <div>
            <h4>Products</h4>
            <Link href="/shop">All Products</Link>
          </div>
          <div>
            <h4>Solutions</h4>
            <Link href="/bulk">Bulk Orders</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link href="/admin">Admin Panel</Link>
          </div>
          <div>
            <h4>Get in touch</h4>
            <span>+91 8069 750 293</span>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Yoode. All rights reserved.</span>
          <span>Made for brands that ship delight.</span>
        </div>
      </div>
    </footer>
  );
}
