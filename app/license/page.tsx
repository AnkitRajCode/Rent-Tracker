import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "MIT License",
  description: "RentTracker is released under the MIT License.",
};

export default function LicensePage() {
  return (
    <div className="min-h-screen bg-[#030304]">
      <div className="sticky top-0 z-10 bg-[#0F1115]/80 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg border border-[#EA580C]/40 flex items-center justify-center">
            <Image src="/rent_logo.png" alt="RentTracker" width={16} height={16} />
          </div>
          <span className="font-heading font-bold text-white text-sm">
            Rent<span className="bg-gradient-to-r from-[#F7931A] to-[#FFD600] bg-clip-text text-transparent">Tracker</span>
          </span>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-mono text-[#94A3B8] hover:text-[#F7931A] transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#EA580C]/20 border border-[#EA580C]/40 flex items-center justify-center flex-shrink-0 mt-1">
            <Scale className="w-5 h-5 text-[#F7931A]" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-white">MIT License</h1>
            <p className="text-[#94A3B8] text-sm font-mono mt-1">
              Copyright &copy; <span className="text-[#F7931A]">2026 NextGenUI</span>
            </p>
          </div>
        </div>

        <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-6 font-mono text-sm text-[#94A3B8] leading-relaxed space-y-4">
          <p className="text-white font-semibold">
            Copyright (c) 2026 NextGenUI<br />
            <span className="text-[#F7931A] font-normal">Created &amp; Designed by: Ankit Raj | Satyajeet Ramnit</span>
          </p>
          <p>
            Permission is hereby granted, free of charge, to any person obtaining a copy
            of this software and associated documentation files (the &ldquo;Software&rdquo;), to deal
            in the Software without restriction, including without limitation the rights
            to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
            copies of the Software, and to permit persons to whom the Software is
            furnished to do so, subject to the following conditions:
          </p>
          <p>
            The above copyright notice and this permission notice shall be included in all
            copies or substantial portions of the Software.
          </p>
          <p className="text-[#94A3B8]/70 text-xs uppercase tracking-wide border-t border-white/10 pt-4">
            THE SOFTWARE IS PROVIDED &ldquo;AS IS&rdquo;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
            IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
            AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
            LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
            OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
            SOFTWARE.
          </p>
        </div>

        <div className="mt-8 text-center space-y-1">
          <p className="text-[#94A3B8] text-xs font-mono">
            &copy; 2026 NextGenUI. All Rights Reserved.
          </p>
          <p className="text-[#94A3B8]/60 text-xs font-mono">
            Created &amp; Designed by Ankit Raj | Satyajeet Ramnit
          </p>
        </div>
      </div>
    </div>
  );
}
