import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-auto py-6 px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#94A3B8]/50">
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left">
          <span>&copy;2026 NextGenUI &middot; All Rights Reserved.</span>
          <span className="hidden sm:inline text-white/50">|</span>
          <span>Created &amp; Designed by <a className="text-amber-50" href="https://ankitraj.pages.dev/" target="_blank">Ankit Raj</a> | <a className="text-amber-50" href="https://satyajeetramnit.vercel.app/" target="_blank">Satyajeet Ramnit</a></span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/privacy-policy"
            className="hover:text-[#F7931A] transition-colors"
          >
            Privacy Policy
          </Link> | 
          <Link
            href="/license"
            className="hover:text-[#F7931A] transition-colors"
          >
            MIT License
          </Link>
        </div>
      </div>
    </footer>
  );
}
