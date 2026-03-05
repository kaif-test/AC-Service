import { useState, useEffect, useRef } from 'react'
import './App.css'

// ── Toast utility ────────────────────────────────────────────
export function showToast(message = 'Thanks — we received your request') {
  const id = 'ac-toast'
  let el = document.getElementById(id)
  if (!el) {
    el = document.createElement('div')
    el.id = id
    Object.assign(el.style, {
      position: 'fixed', right: '20px', bottom: '20px',
      padding: '14px 20px', background: '#1E2A2A', color: '#FFFFFF',
      borderRadius: '10px', boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
      zIndex: 9999, fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
      maxWidth: '320px', lineHeight: '1.5', opacity: '0',
      transition: 'opacity 250ms ease',
    })
    document.body.appendChild(el)
  }
  el.textContent = message
  el.style.opacity = '1'
  clearTimeout(el._timer)
  el._timer = setTimeout(() => {
    el.style.opacity = '0'
  }, 4500)
}

// ── UTM capture ──────────────────────────────────────────────
function getUTMParams() {
  const p = new URLSearchParams(window.location.search)
  return {
    utm_source: p.get('utm_source') || '',
    utm_medium: p.get('utm_medium') || '',
    utm_campaign: p.get('utm_campaign') || '',
    utm_content: p.get('utm_content') || '',
    ad_id: p.get('ad_id') || '',
  }
}

// ── Reusable CTA Button ──────────────────────────────────────
function CTAButton({ children, onClick, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'cta-btn'
  return (
    <button
      className={`${base} ${base}--${variant} ${base}--${size} ${className}`}
      onClick={onClick}
      aria-label={typeof children === 'string' ? children : 'Book AC Cleaning'}
      {...props}
    >
      {children}
    </button>
  )
}

// ── Lead Form ────────────────────────────────────────────────
function LeadForm({ compact = false }) {
  const [fields, setFields] = useState({ name: '', phone: '', area: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const phoneRef = useRef(null)
  const utms = getUTMParams()

  const validate = () => {
    const e = {}
    if (!fields.name.trim()) e.name = 'Please enter your name'
    if (!/^[\d\s\+\-\(\)]{7,15}$/.test(fields.phone.trim())) e.phone = 'Enter a valid phone number'
    if (!fields.area.trim()) e.area = 'Please enter your area or locality'
    return e
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      showToast('Thanks! We got your request — a technician will call you within As soon as possible.')
      // Fire Meta Pixel lead event
      if (window.fbq) window.fbq('track', 'Lead')
      // Fire GA4 event
      if (window.gtag) window.gtag('event', 'generate_lead', { event_category: 'form' })
      fbq('track', 'Lead');
    }, 900)
  }

  const set = (key) => (ev) => {
    setFields(f => ({ ...f, [key]: ev.target.value }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }))
  }

  if (submitted) {
    return (
      <div className="form-success" role="status" aria-live="polite">
        <div className="form-success__icon">✓</div>
        <h3>You're all set!</h3>
        <p>Thanks! We got your request — a technician will call you as soon as possible.</p>
        <div className="form-success__badges">
          <span>📞 Priority callback</span>
          <span>🔒 Privacy protected</span>
        </div>
      </div>
    )
  }

  return (
    <form className={`lead-form ${compact ? 'lead-form--compact' : ''}`} onSubmit={handleSubmit} noValidate>
      {!compact && <h2 className="lead-form__title">Book AC Cleaning — Free Quote in 60s</h2>}

      {/* Hidden UTM fields */}
      {Object.entries(utms).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}

      <div className="form-field">
        <label htmlFor="name" className="form-label">Your Name</label>
        <input
          id="name" type="text" name="name"
          className={`form-input ${errors.name ? 'form-input--error' : ''}`}
          placeholder="e.g. Suraj Patel"
          value={fields.name} onChange={set('name')}
          autoComplete="name"
        />
        {errors.name && <span className="form-error" role="alert">{errors.name}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="phone" className="form-label">Phone Number</label>
        <input
          id="phone" type="tel" name="phone" ref={phoneRef}
          className={`form-input ${errors.phone ? 'form-input--error' : ''}`}
          placeholder="+91 9082333734"
          value={fields.phone} onChange={set('phone')}
          autoComplete="tel"
          pattern="[\d\s\+\-\(\)]{7,15}"
        />
        {errors.phone && <span className="form-error" role="alert">{errors.phone}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="area" className="form-label">Your Area / Locality</label>
        <input
          id="area" type="text" name="area"
          className={`form-input ${errors.area ? 'form-input--error' : ''}`}
          placeholder="e.g. Andheri, Mumbai"
          value={fields.area} onChange={set('area')}
        />
        {errors.area && <span className="form-error" role="alert">{errors.area}</span>}
      </div>

      <CTAButton type="submit" size="lg" className={loading ? 'loading' : ''}>
        {loading ? 'Booking…' : 'Book AC Cleaning'}
      </CTAButton>

      <p className="form-microcopy">No hidden fees &nbsp;•&nbsp; 24/7 support &nbsp;•&nbsp; We respect your privacy</p>
    </form>
  )
}

// ── Header ───────────────────────────────────────────────────
function Header() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`} role="banner">
      <div className="header__inner container">
        <a href="/" className="header__logo" aria-label="AC Pro Home">
          <span className="logo-icon">❄️</span>
          <span className="logo-text">AC<strong>Pro</strong></span>
        </a>
        <nav className="header__nav">
          <a href="tel:+91 9082333734" className="header__phone" aria-label="Call us">
            <span className="phone-icon">📞</span>
            <span className="phone-num">+91 9082333734</span>
          </a>
          <CTAButton
            size="sm"
            onClick={() => document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' })}
          >
            Book AC Cleaning
          </CTAButton>
        </nav>
      </div>
    </header>
  )
}

// ── Hero ─────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="hero" aria-label="Hero section">
      {/* Background gradient as fallback for video */}
      <div className="hero__bg" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1400&auto=format&fit=crop&q=75"
          alt=""
          className="hero__img"
          loading="eager"
          fetchpriority="high"
        />
        <div className="hero__overlay" />
      </div>

      <div className="container hero__inner">
        <div className="hero__content">
          <div className="hero__badge">
            <span>⚡</span> Same-Day Service Available
          </div>
          <h1 className="hero__headline">
            Keep Your Home Cool —<br />
            <em>Fast, Trusted</em> AC Service
          </h1>
          <p className="hero__sub">
            Same-day visits &nbsp;•&nbsp; Certified technicians &nbsp;•&nbsp; Transparent pricing
          </p>
          <div className="hero__actions">
            <CTAButton
              size="lg"
              onClick={() => document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' })}
            >
              Book AC Cleaning
            </CTAButton>
            <a href="tel:+91 9082333734" className="hero__call" aria-label="Call now">
              <span>📞</span> Call Now
            </a>
          </div>
          <div className="hero__trust">
            <span className="trust-item">
              <span className="trust-stars">★★★★★</span>
              <span>4.9 customer rating</span>
            </span>
            <span className="trust-divider" aria-hidden="true">|</span>
            <span className="trust-item">
              <span>✓</span>
              <span>Certified technicians</span>
            </span>
          </div>
        </div>

        {/* Floating form on desktop */}
        <div className="hero__form-card" id="form-section-hero">
          <LeadForm />
        </div>
      </div>
    </section>
  )
}

// ── Benefit Strip ────────────────────────────────────────────
function BenefitStrip() {
  const items = [
    { icon: '⚡', title: 'Same-Day Visits', desc: 'Book before noon, we visit today' },
    { icon: '💰', title: 'Transparent Pricing', desc: 'Fixed quotes, zero surprises' },
    { icon: '🏆', title: 'Satisfaction Guarantee', desc: '100% happy or we return free' },
  ]
  return (
    <section className="benefit-strip" aria-label="Key benefits">
      <div className="container">
        <ul className="benefit-strip__list">
          {items.map((b, i) => (
            <li key={i} className="benefit-item">
              <span className="benefit-icon" aria-hidden="true">{b.icon}</span>
              <div>
                <strong>{b.title}</strong>
                <p>{b.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ── Why Choose Us ────────────────────────────────────────────
function WhyUs() {
  const reasons = [
    {
      img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=70',
      alt: 'Certified AC technician at work',
      title: 'Certified & Vetted Technicians',
      desc: 'Every technician is background-checked, trained, and carries full certification. You get a professional — not a random contractor.',
    },
    {
      img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&auto=format&fit=crop&q=70',
      alt: 'Fast AC service',
      title: 'Fastest Response in the City',
      desc: 'We dispatch within the hour. Most customers get a confirmed slot within 15 minutes of booking.',
    },
    {
      img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&auto=format&fit=crop&q=70',
      alt: 'Happy customer',
      title: 'Upfront, Honest Pricing',
      desc: "You'll see the full quote before we start. No add-ons, no surprise charges. What we say is what you pay.",
    },
  ]
  return (
    <section className="why-us section" aria-labelledby="why-heading">
      <div className="container">
        <div className="section-header">
          <h2 id="why-heading">Why Thousands Choose Us</h2>
          <p>Professional AC care with no hassle, no guesswork</p>
        </div>
        <ul className="why-us__grid">
          {reasons.map((r, i) => (
            <li key={i} className="why-card">
              <div className="why-card__img-wrap">
                <img src={r.img} alt={r.alt} loading="lazy" />
              </div>
              <div className="why-card__body">
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ── Social Proof Strip ───────────────────────────────────────
function SocialProof() {
  return (
    <div className="social-proof">
      <div className="container social-proof__inner">
        <span className="social-proof__stars">★★★★★</span>
        <span className="social-proof__text"><strong>4.9 / 5</strong> from 1,200+ verified reviews</span>
        <span className="social-proof__logo" aria-label="Google Reviews">G</span>
      </div>
    </div>
  )
}

// ── Process Steps ────────────────────────────────────────────
function Process() {
  const steps = [
    { num: '01', icon: '📝', title: 'Book Online', desc: 'Fill the quick form — takes under 60 seconds.' },
    { num: '02', icon: '🚗', title: 'Tech Visits', desc: 'A certified tech arrives at your door, on time.' },
    { num: '03', icon: '❄️', title: 'AC Runs Like New', desc: 'Cool air restored. Full service report provided.' },
  ]
  return (
    <section className="process section" aria-labelledby="process-heading">
      <div className="container">
        <div className="section-header">
          <h2 id="process-heading">How It Works</h2>
          <p>Three easy steps to a cooler home</p>
        </div>
        <ol className="process__steps">
          {steps.map((s, i) => (
            <li key={i} className="process-step">
              <div className="process-step__num" aria-hidden="true">{s.num}</div>
              <div className="process-step__icon" aria-hidden="true">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < steps.length - 1 && <div className="process-step__arrow" aria-hidden="true">→</div>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

// ── Lead Form Section ────────────────────────────────────────
function FormSection() {
  return (
    <section className="form-section section" id="form-section" aria-labelledby="form-heading">
      <div className="container form-section__inner">
        <div className="form-section__left">
          <div className="form-section__badge">Free Quote</div>
          <h2 id="form-heading">Ready for a Cooler Home?</h2>
          <p>Book in under 60 seconds. A technician calls you within as soon as possible.</p>
          <ul className="form-section__bullets">
            <li>✓ No payment required to book</li>
            <li>✓ Same-day availability</li>
            <li>✓ Certified, insured technicians</li>
            <li>✓ Fixed price — no surprise charges</li>
          </ul>
          <div className="trust-badges" aria-label="Trust badges">
            <div className="trust-badge">🛡️ Fully Insured</div>
            <div className="trust-badge">✅ Certified</div>
            <div className="trust-badge">⭐ 4.9 Rating</div>
            <div className="trust-badge">🔒 Secure</div>
          </div>
        </div>
        <div className="form-section__right">
          <LeadForm />
        </div>
      </div>
    </section>
  )
}

// ── Testimonials ─────────────────────────────────────────────
function Testimonials() {
  const reviews = [
    {
      name: 'Sara M.',
      area: 'Mumbai',
      date: 'Jan 2025',
      stars: 5,
      text: 'Technician arrived within 2 hours of booking. Super professional, explained everything clearly. AC now works perfectly. Highly recommend!',
      avatar: 'https://i.pravatar.cc/64?img=47',
    },
    {
      name: 'Khalid R.',
      area: 'CSMT, Mumbai',
      date: 'Feb 2025',
      stars: 5,
      text: 'The pricing was exactly as quoted — no hidden fees. Quick, clean, and effective service. Will definitely book again for regular maintenance.',
      avatar: 'https://i.pravatar.cc/64?img=12',
    },
    {
      name: 'Priya N.',
      area: 'Bandra Mumbai',
      date: 'Mar 2025',
      stars: 5,
      text: 'Booked online, got a call in 20 minutes. Same-day visit and the AC is blowing cold air again. Amazing service and very polite team.',
      avatar: 'https://i.pravatar.cc/64?img=33',
    },
    {
      name: 'Omar H.',
      area: 'Abu Dhabi, Al Reem',
      date: 'Mar 2025',
      stars: 5,
      text: 'Used them for annual AC cleaning. Very thorough job, showed me before and after photos of the filter. Great value for money.',
      avatar: 'https://i.pravatar.cc/64?img=68',
    },
    {
      name: 'Lena K.',
      area: 'Sharjah',
      date: 'Apr 2025',
      stars: 5,
      text: 'Called late at night and they had someone at my door by 9am the next morning. The AC had been leaking for days — fixed in under an hour.',
      avatar: 'https://i.pravatar.cc/64?img=25',
    },
  ]
  return (
    <section className="testimonials section" aria-labelledby="reviews-heading">
      <div className="container">
        <div className="section-header">
          <h2 id="reviews-heading">What Our Customers Say</h2>
          <p>Real reviews from real homeowners across the UAE</p>
        </div>
        <ul className="testimonials__grid">
          {reviews.map((r, i) => (
            <li key={i} className="review-card">
              <div className="review-card__stars" aria-label={`${r.stars} out of 5 stars`}>
                {'★'.repeat(r.stars)}
              </div>
              <blockquote className="review-card__text">"{r.text}"</blockquote>
              <footer className="review-card__footer">
                <img src={r.avatar} alt={`${r.name} photo`} className="review-card__avatar" loading="lazy" width="40" height="40" />
                <div>
                  <strong>{r.name}</strong>
                  <span>{r.area} · {r.date}</span>
                </div>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ── FAQ ──────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState(null)
  const items = [
    {
      q: 'How much does AC cleaning cost?',
      a: 'Standard AC cleaning starts from AED 80 per unit. You\'ll receive a transparent, fixed quote before we begin — no hidden charges, ever.',
    },
    {
      q: 'How quickly can a technician arrive?',
      a: 'We offer same-day visits for bookings placed before 2pm. After booking, a technician will call you within as soon as possible',
    },
    {
      q: 'Do I need to be home during the service?',
      a: 'Yes, someone should be present to let the technician in. The service typically takes 45–90 minutes depending on the number of units.',
    },
    {
      q: 'What if I\'m not satisfied with the service?',
      a: 'We offer a 7-day satisfaction guarantee. If your AC develops the same issue within 7 days of service, we return and fix it at no extra charge.',
    },
    {
      q: 'Can I cancel or reschedule my appointment?',
      a: 'Absolutely. You can cancel or reschedule for free with at least 2 hours notice before the appointment by calling or WhatsApp.',
    },
  ]
  return (
    <section className="faq section" aria-labelledby="faq-heading">
      <div className="container faq__inner">
        <div className="section-header">
          <h2 id="faq-heading">Frequently Asked Questions</h2>
          <p>Everything you need to know before booking</p>
        </div>
        <dl className="faq__list">
          {items.map((item, i) => (
            <div key={i} className={`faq-item ${open === i ? 'faq-item--open' : ''}`}>
              <dt>
                <button
                  className="faq-item__q"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                  aria-controls={`faq-ans-${i}`}
                >
                  {item.q}
                  <span className="faq-item__icon" aria-hidden="true">{open === i ? '−' : '+'}</span>
                </button>
              </dt>
              <dd id={`faq-ans-${i}`} className="faq-item__a" hidden={open !== i}>
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

// ── Footer ───────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="logo-icon">❄️</span>
          <span className="logo-text">AC<strong>Pro</strong></span>
        </div>
        <div className="footer__contact">
          <a href="tel:+91 9082333734" aria-label="Call us">📞 +91 9082333734</a>
          <span>Churchgate, Mumbai</span>
        </div>
        <div className="footer__legal">
          <a href="/privacy">Privacy Policy</a>
          <span>© {new Date().getFullYear()} ACPro. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}

// ── Mobile Sticky CTA ────────────────────────────────────────
function MobileStickyCTA() {
  return (
    <div className="mobile-sticky-cta" aria-label="Quick booking bar">
      <CTAButton
        size="lg"
        onClick={() => document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' })}
      >
        Book AC Cleaning
      </CTAButton>
      <a
        href="tel:+91 9082333734"
        className="cta-btn cta-btn--primary cta-btn--lg"
        style={{ width: 'auto', minWidth: '56px', maxWidth: '56px', padding: '14px', flex: 'none' }}
        aria-label="Call us now"
      >
        📞
      </a>
    </div>
  )
}

// ── App ──────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <BenefitStrip />
        <SocialProof />
        <WhyUs />
        <Process />
        <FormSection />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
      <MobileStickyCTA />
    </>
  )
}
