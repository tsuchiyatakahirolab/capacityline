import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SolutionsNav() {
  return <header className="solutions-nav"><Link href="/" className="solutions-brand"><i>CL</i><span><strong>CapacityLine</strong><small>BY TSUCHIYA LAB</small></span></Link><nav><Link href="/solutions">Use cases</Link><Link href="/trust">Trust</Link><Link href="/demo">Open product <ArrowRight size={13} /></Link></nav></header>;
}

export function SolutionsFooter() {
  return <footer className="solutions-footer"><span>CapacityLine · Supplier recovery, from exception to evidence.</span><div><Link href="/">Home</Link><Link href="/solutions">Use cases</Link><Link href="/demo">Product</Link><Link href="/pilot">Pilot</Link><Link href="/trust">Trust</Link><a href="mailto:info@tsuchiyalab.com">Contact</a></div><span>© 2026 TSUCHIYA LAB</span></footer>;
}
