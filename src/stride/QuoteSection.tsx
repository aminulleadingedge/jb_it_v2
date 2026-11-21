import { useEffect, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { buildWhatsAppUrl, COMPANY_BRAND } from './data';

interface QuoteSectionProps {
  sectionRef: React.RefObject<HTMLElement | null>;
  quotePreset?: { category: string; seq: number };
}

const QUOTE_CATEGORIES = [
  'IPS & Battery',
  'Office Equipment',
  'Network & Accessories',
  'CC Camera Setup',
  'IT Hardware & Accessories',
  'Software Build Solution',
];

export function QuoteSection({ sectionRef, quotePreset }: QuoteSectionProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState(QUOTE_CATEGORIES[0]);
  const [details, setDetails] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedRef, setSubmittedRef] = useState<{
    refCode: string;
    name: string;
    phone: string;
    category: string;
    details: string;
  } | null>(null);

  useEffect(() => {
    if (quotePreset?.category) {
      const matched = QUOTE_CATEGORIES.find((c) =>
        c.toLowerCase().includes(quotePreset.category.toLowerCase()),
      );
      if (matched) {
        setCategory(matched);
        setSubmittedRef(null);
        setErrorMsg('');
      }
    }
  }, [quotePreset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    if (!cleanName || !cleanPhone) {
      setErrorMsg('Please enter your name and phone or WhatsApp number.');
      return;
    }
    setErrorMsg('');
    const refCode = `JB-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedRef({
      refCode,
      name: cleanName,
      phone: cleanPhone,
      category,
      details: details.trim(),
    });
  };

  const resetForm = () => {
    setSubmittedRef(null);
    setName('');
    setPhone('');
    setCompany('');
    setDetails('');
    setErrorMsg('');
  };

  return (
    <section
      id="quote"
      ref={sectionRef}
      aria-label="Request a quote from JB IT"
      className="relative bg-[#191a1e] text-[#f0e8e0] px-5 sm:px-10 lg:px-14 py-20 lg:py-28 border-t border-white/10"
    >
      <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5 space-y-6">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#c99364]">
            Direct Inquiry · Zero Fixed Markups
          </p>
          <h2 className="disp text-4xl sm:text-6xl text-[#f0e8e0] leading-[0.92]">
            REQUEST
            <br />
            A QUOTE
          </h2>
          <p className="text-sm sm:text-base text-[#f0e8e0]/75 leading-relaxed max-w-md">
            Share the equipment capacity, printer model, rack size, or software scope you need. Our team replies promptly with current pricing and installation availability.
          </p>

          <div className="pt-4 border-t border-white/10 space-y-3 text-sm font-mono text-[#f0e8e0]/80">
            <div>
              <span className="text-[#8fa8a3]">PHONE / WHATSAPP: </span>
              <span>{COMPANY_BRAND.displayPhone}</span>
              {COMPANY_BRAND.displayPhoneAlt && (
                <span className="text-[#f0e8e0]/55">{' / '}{COMPANY_BRAND.displayPhoneAlt}</span>
              )}
            </div>
            <div>
              <span className="text-[#8fa8a3]">EMAIL: </span>
              <span>{COMPANY_BRAND.email}</span>
            </div>
            <div>
              <span className="text-[#8fa8a3]">ADDRESS: </span>
              <span>{COMPANY_BRAND.location}</span>
            </div>
          </div>

          <a
            href={buildWhatsAppUrl(category, 'I want to discuss pricing for IPS, IT hardware, or installation services.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#25d366] text-[#111b21] font-semibold text-sm hover:opacity-95 transition-opacity"
          >
            <MessageCircle size={18} aria-hidden="true" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-3xl bg-[#22242c] border border-white/10 p-6 sm:p-8">
            {submittedRef ? (
              <div className="space-y-5 py-4" data-testid="quote-confirmation">
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#8fa8a3]">
                  Quote Request Received · {submittedRef.refCode}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#f0e8e0]">
                  Thank you, {submittedRef.name}
                </h3>
                <p className="text-sm text-[#f0e8e0]/80 leading-relaxed">
                  We have logged your quote inquiry for <strong>{submittedRef.category}</strong> and will reach out to <strong>{submittedRef.phone}</strong> with pricing and setup options.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href={buildWhatsAppUrl(
                      submittedRef.category,
                      `Quote Ref ${submittedRef.refCode} — Name: ${submittedRef.name}, Phone: ${submittedRef.phone}, Category: ${submittedRef.category}${submittedRef.details ? `, Details: ${submittedRef.details}` : ''}`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25d366] text-[#111b21] font-semibold text-sm hover:opacity-95"
                  >
                    <MessageCircle size={16} aria-hidden="true" />
                    <span>Send Copy on WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 rounded-full border border-white/25 text-sm font-medium text-[#f0e8e0] hover:bg-white/10 cursor-pointer"
                  >
                    New Quote Request
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {errorMsg && (
                  <div
                    role="alert"
                    className="rounded-xl bg-[#b88c98]/20 border border-[#b88c98]/50 px-4 py-3 text-sm text-[#f8d7df]"
                  >
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="block font-mono text-xs uppercase tracking-[0.1em] text-[#f0e8e0]/75 mb-1.5">
                      Your Name *
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className="w-full rounded-xl bg-[#191a1e] border border-white/15 px-4 py-3 text-sm text-[#f0e8e0] placeholder:text-[#f0e8e0]/35 focus:outline-none focus:border-[#c99364]"
                    />
                  </label>

                  <label className="block">
                    <span className="block font-mono text-xs uppercase tracking-[0.1em] text-[#f0e8e0]/75 mb-1.5">
                      Phone / WhatsApp *
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+880 1XXX-XXXXXX"
                      className="w-full rounded-xl bg-[#191a1e] border border-white/15 px-4 py-3 text-sm text-[#f0e8e0] placeholder:text-[#f0e8e0]/35 focus:outline-none focus:border-[#c99364]"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="block font-mono text-xs uppercase tracking-[0.1em] text-[#f0e8e0]/75 mb-1.5">
                      Category / Solution
                    </span>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl bg-[#191a1e] border border-white/15 px-4 py-3 text-sm text-[#f0e8e0] focus:outline-none focus:border-[#c99364]"
                    >
                      {QUOTE_CATEGORIES.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="block font-mono text-xs uppercase tracking-[0.1em] text-[#f0e8e0]/75 mb-1.5">
                      Company / Shop (Optional)
                    </span>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Organization name"
                      className="w-full rounded-xl bg-[#191a1e] border border-white/15 px-4 py-3 text-sm text-[#f0e8e0] placeholder:text-[#f0e8e0]/35 focus:outline-none focus:border-[#c99364]"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="block font-mono text-xs uppercase tracking-[0.1em] text-[#f0e8e0]/75 mb-1.5">
                    Hardware Specs, Quantity &amp; Location
                  </span>
                  <textarea
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="e.g., 2000VA IPS + 200Ah battery, or 4 CCTV cameras + 12U rack installation in Dhaka..."
                    className="w-full rounded-xl bg-[#191a1e] border border-white/15 px-4 py-3 text-sm text-[#f0e8e0] placeholder:text-[#f0e8e0]/35 focus:outline-none focus:border-[#c99364]"
                  />
                </label>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#f0e8e0] text-[#191a1e] font-bold text-sm hover:bg-white transition-colors cursor-pointer"
                >
                  <Send size={15} aria-hidden="true" />
                  <span>Submit Quote Request</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
