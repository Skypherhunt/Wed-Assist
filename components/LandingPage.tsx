'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useLenis } from 'lenis/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowUpRight, ArrowRight, ArrowLeft, Heart, Star, Check, ChevronDown, Sparkles,
  Palette, Share2, ClipboardList, ShieldCheck, MessageCircle, Link2, Download,
  CalendarHeart, MapPin, Users, Quote,
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

// Same app now — this is the live seeded demo wedding, not an external URL.
const DEMO_URL = '/aarav-and-diya'
const CTA_LABEL = 'See the live demo'

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const NAV_LINKS = [
  { label: 'Tour', href: '#tour' },
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how' },
  { label: 'FAQ', href: '#faq' },
]

/* ================================================================
   Reusable — Marquee ticker
================================================================ */
function Marquee({ items, reverse = false, className = '' }: { items: string[]; reverse?: boolean; className?: string }) {
  const doubled = [...items, ...items]
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className={`flex w-max ${reverse ? 'animate-marquee-rev' : 'animate-marquee'}`}>
        {doubled.map((it, i) => (
          <span key={i} className="flex items-center gap-4 px-6 whitespace-nowrap">
            <span className="font-display italic text-2xl sm:text-3xl">{it}</span>
            <Heart className="h-3.5 w-3.5 shrink-0 fill-current opacity-50" />
          </span>
        ))}
      </div>
    </div>
  )
}

/* ================================================================
   Product mockups (built from divs — this is the actual product)
================================================================ */
function PhoneMock({ variant = 'invite', className = '' }) {
  return (
    <div className={`relative w-[240px] sm:w-[264px] ${className}`}>
      <div className="relative rounded-[2.4rem] bg-land-ink p-2.5 shadow-2xl shadow-land-ink/30">
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 h-5 w-24 rounded-b-2xl bg-land-ink z-20" />
        <div className="relative overflow-hidden rounded-[1.9rem] bg-land-background aspect-[9/19]">
          {variant === 'invite' ? (
            <div className="flex h-full flex-col">
              <div className="relative h-[46%] bg-gradient-to-br from-land-primary/85 to-land-primary-dark flex flex-col items-center justify-center text-center px-4">
                <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/80">Together with our families</span>
                <span className="mt-3 font-display text-2xl text-white leading-tight">Aarav<br /><span className="font-serif italic text-lg">&amp;</span><br />Diya</span>
                <span className="mt-3 font-mono text-[9px] tracking-[0.2em] text-white/85">12 · 12 · 2026</span>
              </div>
              <div className="flex-1 px-4 py-4">
                <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-land-primary">The celebrations</span>
                {[['Mehndi', '10 Dec'], ['Sangeet', '11 Dec'], ['Ceremony', '12 Dec']].map(([n, d]) => (
                  <div key={n} className="mt-2.5 flex items-center justify-between border-b border-land-divider pb-2">
                    <div className="flex items-center gap-1.5">
                      <CalendarHeart className="h-3 w-3 text-land-primary" />
                      <span className="font-display text-xs text-land-ink">{n}</span>
                    </div>
                    <span className="font-mono text-[8px] text-land-muted">{d}</span>
                  </div>
                ))}
                <div className="mt-4 rounded-xl bg-land-primary py-2 text-center font-semibold text-[11px] text-white">RSVP now</div>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col px-4 py-6">
              <span className="font-mono text-[8px] uppercase tracking-[0.24em] text-land-primary">Will you join us?</span>
              <span className="mt-2 font-display text-lg text-land-ink leading-tight">RSVP</span>
              <div className="mt-4 space-y-3">
                <div>
                  <span className="font-mono text-[7px] uppercase tracking-widest text-land-muted">Your name</span>
                  <div className="mt-1 rounded-lg border border-land-divider bg-land-surface px-2.5 py-1.5 font-display text-[11px] text-land-ink">Priya Sharma</div>
                </div>
                <div>
                  <span className="font-mono text-[7px] uppercase tracking-widest text-land-muted">Attending?</span>
                  <div className="mt-1 flex gap-1.5">
                    <div className="flex-1 rounded-lg bg-land-primary py-1.5 text-center text-[10px] font-semibold text-white">Joyfully yes</div>
                    <div className="flex-1 rounded-lg border border-land-divider py-1.5 text-center text-[10px] text-land-muted">No</div>
                  </div>
                </div>
                <div>
                  <span className="font-mono text-[7px] uppercase tracking-widest text-land-muted">Guests in your party</span>
                  <div className="mt-1 flex items-center justify-between rounded-lg border border-land-divider px-2.5 py-1.5">
                    <span className="text-land-muted">−</span>
                    <span className="font-display text-xs text-land-ink">4</span>
                    <span className="text-land-primary">+</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-2">
                <Check className="h-3 w-3 text-emerald-600" strokeWidth={3} />
                <span className="font-mono text-[8px] text-emerald-700">RSVP received — see you there!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BrowserMock({ variant = 'dashboard', className = '' }) {
  return (
    <div className={`w-full max-w-md rounded-2xl bg-land-surface hairline shadow-2xl shadow-land-ink/20 overflow-hidden ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-land-divider px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-land-primary/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-land-accent/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/50" />
        <span className="ml-3 flex-1 rounded-md bg-land-background px-2 py-1 font-mono text-[9px] text-land-muted truncate">
          wedassist.app/dashboard{variant === 'guests' ? '/guests' : ''}
        </span>
      </div>
      {variant === 'dashboard' ? (
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2">
            {[['142', 'Attending', 'text-emerald-600'], ['18', 'Declined', 'text-land-muted'], ['31', 'Pending', 'text-land-primary']].map(([n, l, c]) => (
              <div key={l} className="rounded-xl bg-land-background p-2.5 text-center">
                <div className={`font-display text-xl ${c}`}>{n}</div>
                <div className="font-mono text-[7px] uppercase tracking-widest text-land-muted">{l}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-land-background p-3">
            <span className="font-mono text-[8px] uppercase tracking-widest text-land-muted">Confirmed by invite source</span>
            {[['Mom’s family', 82], ['College friends', 41], ['Direct link', 19]].map(([n, w]) => (
              <div key={n} className="mt-2">
                <div className="flex justify-between font-display text-[10px] text-land-ink"><span>{n}</span><span>{w}</span></div>
                <div className="mt-1 h-1.5 rounded-full bg-land-divider overflow-hidden">
                  <div className="h-full rounded-full bg-land-primary" style={{ width: `${w}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-sm text-land-ink">Guest list</span>
            <span className="font-mono text-[8px] uppercase tracking-widest text-land-primary bg-land-primary/10 px-2 py-0.5 rounded-full">191 guests</span>
          </div>
          {[['Priya Sharma', 'Attending · 4', 'emerald'], ['Rohan Mehta', 'Pending', 'muted'], ['Ananya Rao', 'Attending · 2', 'emerald'], ['Vikram Nair', 'Declined', 'rose']].map(([n, s, tone]) => (
            <div key={n} className="mt-2 flex items-center justify-between rounded-lg border border-land-divider px-2.5 py-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-land-primary/15 font-display text-[9px] text-land-primary-dark">{n[0]}</span>
                <span className="font-display text-[11px] text-land-ink">{n}</span>
              </div>
              <span className={`font-mono text-[8px] ${tone === 'emerald' ? 'text-emerald-600' : tone === 'rose' ? 'text-land-primary-dark' : 'text-land-muted'}`}>{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ================================================================
   Signature — RSVPs arriving (falling hearts into a live tally)
================================================================ */
function RsvpSignature() {
  const [statusIdx, setStatusIdx] = useState(0)
  const [count, setCount] = useState(112)
  const statuses = [
    { text: 'New RSVP · attending', label: 'Yes', tone: 'primary' },
    { text: 'Party of 4 confirmed', label: 'Guests', tone: 'accent' },
    { text: 'Meal choices saved', label: 'Menu', tone: 'emerald' },
    { text: 'Guest list synced', label: 'Done', tone: 'emerald' },
  ]
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIdx((idx) => {
        const next = (idx + 1) % statuses.length
        if (statuses[next].label === 'Done') setCount((c) => c + 3)
        return next
      })
    }, 2300)
    return () => clearInterval(interval)
  }, [])
  const drops = [
    { left: '15%', delay: '0.0s', dur: '2.6s', size: 15 }, { left: '26%', delay: '1.3s', dur: '3.0s', size: 12 },
    { left: '38%', delay: '0.6s', dur: '2.8s', size: 17 }, { left: '50%', delay: '1.8s', dur: '2.4s', size: 13 },
    { left: '62%', delay: '0.9s', dur: '3.1s', size: 16 }, { left: '74%', delay: '2.0s', dur: '2.7s', size: 12 },
    { left: '85%', delay: '0.4s', dur: '2.9s', size: 15 },
  ]
  const ripples = [{ left: '24%', delay: '0.2s' }, { left: '50%', delay: '1.0s' }, { left: '76%', delay: '1.8s' }]
  const status = statuses[statusIdx]
  const toneText = status.tone === 'emerald' ? 'text-emerald-600' : status.tone === 'accent' ? 'text-land-accent-dark' : 'text-land-primary-dark'
  const toneDot = status.tone === 'emerald' ? 'bg-emerald-500' : status.tone === 'accent' ? 'bg-land-accent' : 'bg-land-primary'
  return (
    <div className="relative h-full min-h-[13rem] w-full rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(180deg, #FDF4F1 0%, #F7E7E4 70%, #F0DAD8 100%)' }}>
      <div className="absolute -top-8 -left-6 h-20 w-32 rounded-full bg-white/60 blur-2xl" />
      <div className="absolute top-2 right-10 h-14 w-24 rounded-full bg-white/50 blur-xl" />
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <Heart className="h-3.5 w-3.5 text-land-primary-dark" strokeWidth={2.4} fill="currentColor" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-land-primary-dark">RSVPs live</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-display font-semibold text-sm text-land-ink tabular-nums">{count}</span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-land-muted">confirmed</span>
        </div>
      </div>
      <svg className="absolute left-3 right-3 top-9 h-5" viewBox="0 0 400 20" preserveAspectRatio="none">
        <path d="M0 4 Q 200 22 400 4" fill="none" stroke="#B76E79" strokeOpacity="0.4" strokeWidth="1.5" />
        {[60, 152, 248, 340].map((x) => (<circle key={x} cx={x} cy="9" r="2.4" fill="#C39B4E" fillOpacity="0.8" />))}
      </svg>
      <div className="absolute inset-x-0 top-14 bottom-11 overflow-hidden">
        {drops.map((d, i) => (
          <svg key={i} className="absolute top-0" style={{ left: d.left, width: `${d.size}px`, height: `${d.size}px`, animation: `rain-fall ${d.dur} cubic-bezier(0.55,0.05,0.7,0.45) ${d.delay} infinite`, filter: 'drop-shadow(0 1px 2px rgba(148,81,92,0.28))', transform: 'translateX(-50%)' }} viewBox="0 0 24 24">
            <defs><linearGradient id={`heart-${i}`} x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#E0B9BF" /><stop offset="55%" stopColor="#B76E79" /><stop offset="100%" stopColor="#94515C" /></linearGradient></defs>
            <path d="M12 21s-6.9-4.6-9.5-8.7C1 9.8 2.3 6.4 5.4 5.6c2-.5 3.9.5 6.6 3 2.7-2.5 4.6-3.5 6.6-3 3.1.8 4.4 4.2 2.9 6.7C18.9 16.4 12 21 12 21z" fill={`url(#heart-${i})`} />
            <ellipse cx="8.5" cy="10" rx="1.6" ry="2.4" fill="white" fillOpacity="0.5" />
          </svg>
        ))}
      </div>
      <svg className="absolute bottom-9 left-3 right-3 h-3" viewBox="0 0 200 12" preserveAspectRatio="none">
        <path d="M 0,6 Q 12.5,2 25,6 T 50,6 T 75,6 T 100,6 T 125,6 T 150,6 T 175,6 T 200,6" fill="none" stroke="#94515C" strokeOpacity="0.4" strokeWidth="1.2" />
      </svg>
      <div className="absolute bottom-[34px] left-3 right-3 h-2">
        {ripples.map((r, i) => (<span key={i} className="absolute top-0 -translate-x-1/2 rounded-full border border-land-primary-dark/40" style={{ left: r.left, width: '4px', height: '4px', animation: `rain-ripple 2.4s ease-out ${r.delay} infinite` }} />))}
      </div>
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`relative h-2 w-2 rounded-full ${toneDot}`}>{status.tone === 'primary' && <span className={`absolute inset-0 rounded-full ${toneDot} animate-ping`} />}</span>
          <span key={status.text} className={`font-mono text-[10px] truncate ${toneText}`} style={{ animation: 'rain-fadein 0.35s ease-out' }}>{status.text}</span>
        </div>
        <span className={`font-mono text-[9px] uppercase tracking-[0.2em] whitespace-nowrap pl-2 ${toneText}`}>{status.label}</span>
      </div>
      <style>{`
        @keyframes rain-fall { 0% { transform: translate(-50%, -10px); opacity: 0; } 12% { opacity: 1; } 82% { opacity: 1; } 100% { transform: translate(-50%, 95px); opacity: 0; } }
        @keyframes rain-ripple { 0% { transform: translateX(-50%) scale(0.4); opacity: 0.9; } 80% { transform: translateX(-50%) scale(3.5); opacity: 0; } 100% { transform: translateX(-50%) scale(3.5); opacity: 0; } }
        @keyframes rain-fadein { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

/* ================================================================
   Navbar — editorial top bar
================================================================ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'glass border-b border-land-primary/10 py-3' : 'py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex items-center justify-between">
        <a href="#home" className="flex items-baseline gap-2 group">
          <span className="font-display text-xl tracking-tight text-land-ink">Wed</span>
          <span className="font-serif italic text-xl text-land-primary">Assist</span>
        </a>
        <div className="hidden md:flex items-center gap-9">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="font-mono text-[11px] uppercase tracking-[0.15em] text-land-muted hover:text-land-ink lift-on-hover transition-colors">{l.label}</a>
          ))}
          <Link href="/login" className="font-mono text-[11px] uppercase tracking-[0.15em] text-land-muted hover:text-land-ink lift-on-hover transition-colors">Log in</Link>
        </div>
        <a href={DEMO_URL} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1.5 font-display text-sm text-land-ink">
          <span className="border-b-2 border-land-primary pb-0.5 group-hover:border-land-ink transition-colors">{CTA_LABEL}</span>
          <ArrowUpRight className="h-4 w-4 text-land-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>
    </nav>
  )
}

/* ================================================================
   Hero — asymmetric editorial + phone mock + masked reveal
================================================================ */
function Hero() {
  const ref = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (prefersReducedMotion) return
    const ctx = gsap.context(() => {
      gsap.from('.reveal-inner', { yPercent: 120, duration: 1.1, stagger: 0.1, ease: 'power4.out', delay: 0.15 })
      gsap.from('.hero-fade', { y: 20, opacity: 0, duration: 0.9, stagger: 0.12, delay: 0.7, ease: 'power3.out' })
      gsap.from('.hero-phone', { y: 60, opacity: 0, rotate: 6, duration: 1.2, delay: 0.5, ease: 'power3.out' })
      gsap.from('.hero-chip', { scale: 0.6, opacity: 0, duration: 0.6, stagger: 0.15, delay: 1.1, ease: 'back.out(1.7)' })
    }, ref)
    return () => ctx.revert()
  }, [])
  return (
    <section id="home" ref={ref} className="paper relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="absolute top-20 -right-32 h-96 w-96 rounded-full bg-land-primary/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-land-accent/10 blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 grid lg:grid-cols-12 gap-12 items-center">
        {/* Left — editorial headline */}
        <div className="lg:col-span-7">
          <div className="hero-fade flex items-center gap-3 mb-8">
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-land-primary">01 — The invitation, reimagined</span>
            <span className="h-px w-16 bg-land-primary/40" />
          </div>
          <h1 className="font-display text-[3.4rem] sm:text-7xl lg:text-[6rem] leading-[0.92] tracking-tight text-land-ink">
            <span className="mask-line"><span className="reveal-inner block">One link for</span></span>
            <span className="mask-line"><span className="reveal-inner block">your <span className="font-serif italic text-land-primary">whole</span></span></span>
            <span className="mask-line"><span className="reveal-inner block">wedding.</span></span>
          </h1>
          <p className="hero-fade mt-8 max-w-md text-land-muted text-base sm:text-lg leading-relaxed">
            A beautiful invitation site — your events, gallery, RSVPs and a live guest list — all
            behind a single link your families will actually love using.
          </p>
          <div className="hero-fade mt-10 flex flex-wrap items-center gap-6">
            <a href={DEMO_URL} target="_blank" rel="noreferrer" className="magnetic-btn inline-flex items-center gap-2 bg-land-ink text-land-background px-7 py-3.5 rounded-full font-semibold shadow-xl shadow-land-ink/20">
              {CTA_LABEL} <ArrowUpRight className="h-4 w-4" />
            </a>
            <a href="#tour" className="group inline-flex items-center gap-2 font-display text-land-ink">
              <span className="border-b border-land-ink/30 pb-0.5 group-hover:border-land-ink transition-colors">Take the tour</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
          <div className="hero-fade mt-10 flex items-center gap-3 text-land-muted">
            <span className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-land-accent text-land-accent" />)}</span>
            <span className="font-mono text-xs">Built for Mehndi to Reception</span>
          </div>
        </div>
        {/* Right — phone mock with floating chips */}
        <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
          <div className="hero-phone relative">
            <PhoneMock variant="invite" className="rotate-[4deg]" />
            <div className="hero-chip absolute -left-8 top-16 glass rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 ring-pulse" />
              <span className="font-mono text-[10px] text-land-ink">142 confirmed</span>
            </div>
            <div className="hero-chip absolute -right-4 bottom-24 glass rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2">
              <Heart className="h-3.5 w-3.5 text-land-primary fill-land-primary" />
              <span className="font-mono text-[10px] text-land-ink">New RSVP · attending</span>
            </div>
            <div className="hero-chip absolute -left-6 bottom-8 glass rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2">
              <Palette className="h-3.5 w-3.5 text-land-accent-dark" />
              <span className="font-mono text-[10px] text-land-ink">8 themes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   Marquee band
================================================================ */
function MarqueeBand() {
  return (
    <section className="bg-land-ink text-land-background py-5 border-y border-land-ink">
      <Marquee items={['Your themes', 'Live RSVPs', 'One shareable link', 'Guest list', 'Photo gallery', 'Every event', 'CSV export']} />
    </section>
  )
}

/* ================================================================
   Product tour — horizontal pinned scroll (dark band)
================================================================ */
const TOUR = [
  { n: '01', title: 'Your invitation', text: 'A full-screen invite with your story, hashtag and date — in a theme that feels like you two.', mock: <PhoneMock variant="invite" /> },
  { n: '02', title: 'Guests RSVP in taps', text: 'No account, no app. Guests open your link, say yes, pick a party size and meal — done.', mock: <PhoneMock variant="rsvp" /> },
  { n: '03', title: 'You watch it fill up', text: 'Every reply lands on your dashboard live, with headcounts and a breakdown by invite source.', mock: <BrowserMock variant="dashboard" /> },
  { n: '04', title: 'One guest list, sorted', text: 'A master list that dedupes itself — attending, pending, declined — export it whenever you like.', mock: <BrowserMock variant="guests" /> },
]

function ProductTour() {
  const section = useRef<HTMLElement | null>(null)
  const track = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (prefersReducedMotion) return
    const ctx = gsap.context(() => {
      const t = track.current!
      const getDist = () => Math.max(0, t.scrollWidth - section.current!.clientWidth)
      gsap.to(t, {
        x: () => -getDist(),
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: () => '+=' + getDist(),
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
    }, section)
    return () => ctx.revert()
  }, [])
  return (
    <section id="tour" ref={section} className="relative bg-land-deep text-land-background overflow-hidden min-h-screen flex flex-col justify-center py-20">
      <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-14 mb-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-land-primary-light">02 — The tour</span>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.02]">
              See it the way <span className="font-serif italic text-land-primary-light">your guests will.</span>
            </h2>
          </div>
          <span className="hidden sm:flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-land-background/50 pb-2">
            Scroll <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
      <div
        ref={track}
        className={`flex gap-6 px-6 sm:px-10 lg:px-14 ${prefersReducedMotion ? 'overflow-x-auto snap-x snap-mandatory scrollbar-hide' : 'w-max'}`}
      >
        {TOUR.map((p) => (
          <article key={p.n} className="snap-center shrink-0 w-[86vw] sm:w-[68vw] lg:w-[46vw] rounded-4xl border border-land-background/10 bg-land-background/[0.04] backdrop-blur-sm p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-8">
            <div className="shrink-0 flex justify-center">{p.mock}</div>
            <div className="flex-1">
              <span className="font-display text-6xl text-land-primary-light/30 index-num leading-none">{p.n}</span>
              <h3 className="mt-3 font-display text-2xl sm:text-3xl tracking-tight">{p.title}</h3>
              <p className="mt-3 text-land-background/70 leading-relaxed">{p.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ================================================================
   Features — bento grid
================================================================ */
function Features() {
  const ref = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (prefersReducedMotion) return
    const ctx = gsap.context(() => {
      gsap.from('.bento-tile', {
        scrollTrigger: { trigger: ref.current, start: 'top 78%', once: true },
        y: 34, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
      })
    }, ref)
    return () => ctx.revert()
  }, [])
  return (
    <section id="features" ref={ref} className="bg-land-background py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
        <div className="max-w-2xl mb-14">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-land-primary">03 — Everything included</span>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl lg:text-6xl tracking-tight text-land-ink leading-[1.02]">
            Less a form, more a <span className="font-serif italic text-land-primary">keepsake.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 auto-rows-[minmax(0,auto)] gap-4">
          {/* Big signature tile */}
          <div className="bento-tile lg:col-span-7 lg:row-span-2 rounded-3xl bg-land-surface hairline p-6 sm:p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-land-primary" strokeWidth={2.3} />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-land-muted">Live RSVP feed</span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl text-land-ink mb-1">Watch the “yes”es roll in</h3>
            <p className="text-land-muted text-sm leading-relaxed mb-5 max-w-md">Every reply arrives the moment a guest submits — with party size, meals and a message. Your headcount updates itself.</p>
            <div className="flex-1 min-h-[13rem]"><RsvpSignature /></div>
          </div>
          {/* Themes tile */}
          <div className="bento-tile lg:col-span-5 rounded-3xl bg-land-ink text-land-background p-6 sm:p-8 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center gap-2 mb-3"><Palette className="h-5 w-5 text-land-primary-light" strokeWidth={2.3} /><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-land-background/50">8 premium themes</span></div>
              <h3 className="font-display text-2xl sm:text-3xl">A look that’s yours</h3>
              <p className="text-land-background/60 text-sm mt-2 leading-relaxed">Each theme has its own palette, display font and script flourish. Switch anytime — one click restyles everything.</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {[['#7A2E3A', 'Royal'], ['#B76E79', 'Floral'], ['#241C1E', 'Noir'], ['#125D4C', 'Emerald'], ['#8A9A5B', 'Sage']].map(([c, n]) => (
                <span key={n} className="flex items-center gap-1.5 rounded-full bg-land-background/10 pl-1.5 pr-3 py-1"><span className="h-3.5 w-3.5 rounded-full" style={{ background: c }} /><span className="font-mono text-[9px] uppercase tracking-wider text-land-background/80">{n}</span></span>
              ))}
            </div>
          </div>
          {/* Invite links tile */}
          <div className="bento-tile lg:col-span-5 rounded-3xl bg-land-surface hairline p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-3"><Share2 className="h-5 w-5 text-land-primary" strokeWidth={2.3} /><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-land-muted">Shareable invite links</span></div>
            <h3 className="font-display text-2xl text-land-ink">One link, everyone tracked</h3>
            <p className="text-land-muted text-sm mt-2 leading-relaxed">Hand parents a link to forward, or send each guest their own. You always know who replied — and whose network responded.</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 rounded-xl bg-land-background px-3 py-2 min-w-0"><Link2 className="h-3.5 w-3.5 text-land-muted shrink-0" /><span className="font-mono text-[10px] text-land-ink/70 truncate">wed.link/aarav-diya?g=…</span></div>
              <span className="inline-flex items-center gap-1 rounded-xl bg-[#25D366]/90 text-white px-3 py-2 text-xs font-semibold"><MessageCircle className="h-3.5 w-3.5" /> Share</span>
            </div>
          </div>
          {/* Small tiles row */}
          {[
            { icon: ClipboardList, t: 'Master guest list', d: 'Auto-deduped, editable, always the source of truth.' },
            { icon: Download, t: 'Excel-safe export', d: 'One click. Names, status, party, source, meals.' },
            { icon: ShieldCheck, t: 'Private by default', d: 'Unpublished until you’re ready; data isolated per couple.' },
          ].map((f, i) => (
            <div key={i} className="bento-tile lg:col-span-4 rounded-3xl bg-land-surface hairline p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-land-primary/10 mb-4"><f.icon className="h-5 w-5 text-land-primary" strokeWidth={2.3} /></span>
              <h3 className="font-display text-lg text-land-ink">{f.t}</h3>
              <p className="text-land-muted text-sm mt-1.5 leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   How it works — draw-on-scroll timeline
================================================================ */
const STEPS = [
  { n: '01', eyebrow: 'Create', title: 'Sign up in 60 seconds', text: 'An email is all it takes. You instantly get your own wedding site with a link that’s ready to share — no card, nothing to install.' },
  { n: '02', eyebrow: 'Personalise', title: 'Make it unmistakably yours', text: 'Choose a theme, write your story, add every event from Mehndi to Reception with venues and maps, and upload the photos that tell it best.' },
  { n: '03', eyebrow: 'Share & track', title: 'Send it, watch it fill up', text: 'Share one link with everyone or a private one per guest. RSVPs and your guest list update live — export the final list whenever you’re ready.' },
]

function Process() {
  const ref = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (prefersReducedMotion) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.process-fill', { scaleY: 0 }, {
        scaleY: 1, ease: 'none', transformOrigin: 'top',
        scrollTrigger: { trigger: '.process-rail', start: 'top 60%', end: 'bottom 70%', scrub: 1 },
      })
      gsap.from('.process-step', {
        scrollTrigger: { trigger: ref.current, start: 'top 70%', once: true },
        y: 30, opacity: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out',
      })
    }, ref)
    return () => ctx.revert()
  }, [])
  return (
    <section id="how" ref={ref} className="bg-land-surface py-24 sm:py-32">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-14">
        <div className="max-w-2xl mb-16">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-land-primary">04 — How it works</span>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl lg:text-6xl tracking-tight text-land-ink leading-[1.02]">
            From “we’re engaged” to <span className="font-serif italic text-land-primary">“see you there.”</span>
          </h2>
        </div>
        <div className="process-rail relative pl-14 sm:pl-0">
          {/* Rail */}
          <div className="absolute left-4 sm:left-1/2 sm:-translate-x-1/2 top-2 bottom-2 w-px bg-land-divider" />
          <div className="process-fill absolute left-4 sm:left-1/2 sm:-translate-x-1/2 top-2 bottom-2 w-px bg-land-primary origin-top" />
          <div className="space-y-12 sm:space-y-20">
            {STEPS.map((s, i) => {
              const right = i % 2 === 1
              return (
                <div key={s.n} className={`process-step relative sm:grid sm:grid-cols-2 sm:gap-12 items-center`}>
                  {/* node */}
                  <span className="absolute left-4 sm:left-1/2 -translate-x-1/2 top-1 sm:top-1/2 sm:-translate-y-1/2 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-land-surface border-2 border-land-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-land-primary" />
                  </span>
                  <div className={`${right ? 'sm:col-start-2 sm:pl-10' : 'sm:col-start-1 sm:pr-10 sm:text-right'}`}>
                    <span className="font-display text-5xl sm:text-6xl text-land-primary/15 index-num leading-none">{s.n}</span>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-land-primary mt-2">{s.eyebrow}</p>
                    <h3 className="font-display text-2xl sm:text-3xl text-land-ink tracking-tight mt-2">{s.title}</h3>
                    <p className="text-land-muted mt-3 leading-relaxed max-w-sm sm:inline-block">{s.text}</p>
                    {i === STEPS.length - 1 && (
                      <div className={`mt-6 flex ${right ? '' : 'sm:justify-end'}`}>
                        <a href={DEMO_URL} target="_blank" rel="noreferrer" className="magnetic-btn inline-flex items-center gap-2 bg-land-primary text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-land-primary/30">
                          {CTA_LABEL} <ArrowUpRight className="h-4 w-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   Stat band — dark editorial
================================================================ */
function CountUp({ end, suffix = '', duration = 1800 }: { end: number; suffix?: string; duration?: number }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement | null>(null)
  const started = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const startTs = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - startTs) / duration)
          const eased = 1 - Math.pow(1 - t, 3)
          setValue(Math.round(end * eased))
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.4 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [end, duration])
  return <span ref={ref} className="tabular-nums">{value}{suffix}</span>
}

const STATS = [
  { end: 8, suffix: '', text: 'handcrafted themes, each with its own fonts & palette' },
  { end: 60, suffix: 's', text: 'from sign-up to a live wedding site you can share' },
  { end: 100, suffix: '%', text: 'of your RSVPs, headcounts & meals on one dashboard' },
]

function StatBand() {
  return (
    <section className="bg-land-deep text-land-background py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
        <div className="grid sm:grid-cols-3 gap-y-12 gap-x-8">
          {STATS.map((s, i) => (
            <div key={i} className={`${i < STATS.length - 1 ? 'sm:border-r sm:border-land-background/15' : ''} sm:pr-8`}>
              <div className="font-display text-6xl sm:text-7xl lg:text-8xl tracking-tight leading-none text-land-background">
                <CountUp end={s.end} suffix={s.suffix} />
              </div>
              <p className="mt-4 text-land-background/60 text-sm leading-relaxed max-w-[15rem]">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   Testimonial — tilted postcard
================================================================ */
function Testimonial() {
  return (
    <section className="bg-land-background py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-6 sm:px-10">
        <div className="relative rotate-[-1.5deg] rounded-3xl bg-land-surface hairline edge-shadow p-8 sm:p-14">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-28 rounded-sm bg-land-primary/20 rotate-[-2deg]" />
          <Quote className="h-10 w-10 text-land-primary/30 mb-6" />
          <blockquote className="font-serif italic text-2xl sm:text-4xl text-land-ink leading-snug">
            We sent one link to both our families and watched every RSVP land in real time. Wed Assist
            made the most chaotic part of wedding planning feel calm.
          </blockquote>
          <div className="mt-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-land-primary/15 font-display text-lg text-land-primary-dark">A&amp;D</span>
              <div>
                <p className="font-display font-semibold text-land-ink">Aarav &amp; Diya</p>
                <p className="text-land-muted text-sm flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Married Dec 2026 · Jaipur</p>
              </div>
            </div>
            <span className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-5 w-5 fill-land-accent text-land-accent" />)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   Conversion — styled like a formal RSVP card
================================================================ */
function InviteCTA() {
  const included = [
    'Your own wedding site + shareable link', 'All 8 premium themes to switch between',
    'Unlimited events, venues, maps & photos', 'Live RSVP dashboard + guest list',
    'Group & private invite links with tracking', 'One-click CSV export of your list',
  ]
  return (
    <section id="offer" className="paper py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-6 sm:px-10">
        <div className="relative rounded-[2rem] bg-land-surface p-2">
          <div className="rounded-[1.6rem] border border-land-primary/30 p-8 sm:p-14 text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-land-primary">See it for yourself</span>
            <h2 className="mt-5 font-display text-3xl sm:text-5xl lg:text-6xl tracking-tight text-land-ink leading-[1.02]">
              Step inside a <span className="font-serif italic text-land-primary">real</span> wedding site.
            </h2>
            <p className="mt-5 text-land-muted max-w-xl mx-auto leading-relaxed">
              Open Aarav &amp; Diya’s live invitation and click through the whole guest experience — the
              hero, the events, the gallery and the RSVP flow. Exactly what your guests will see.
            </p>
            <ul className="mt-8 grid sm:grid-cols-2 gap-x-8 gap-y-2.5 text-left max-w-xl mx-auto">
              {included.map((it, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-land-ink/85">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-land-primary/15 shrink-0"><Check className="h-3 w-3 text-land-primary-dark" strokeWidth={3} /></span>
                  {it}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col items-center gap-4">
              <a href={DEMO_URL} target="_blank" rel="noreferrer" className="magnetic-btn inline-flex items-center justify-center gap-2 bg-land-ink text-land-background px-10 py-4 rounded-full font-semibold text-lg shadow-xl shadow-land-ink/20">
                {CTA_LABEL} <ArrowUpRight className="h-5 w-5" />
              </a>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-land-muted">Free to start · No sign-up to view the demo</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   FAQ — two-column with sticky heading
================================================================ */
const FAQ = [
  { q: 'Is it really free to start?', a: 'Yes. You can create your wedding site, pick a theme, add your events and photos, and share your link without paying anything. Explore the live demo to see exactly what you get.' },
  { q: 'Do my guests need an account?', a: 'No. Guests simply open your link and RSVP in a few taps — no login, no app to download. You’re the only one who signs in, to manage everything from your dashboard.' },
  { q: 'Can I use my own photos, events and wording?', a: 'Absolutely. Everything is editable in-app: your names, date, hashtag, a tagline in your own words, every function with its venue and map, and a full photo gallery you upload yourself.' },
  { q: 'How do I know who’s coming?', a: 'Your dashboard shows every reply the moment it arrives — attending or not, party size, meal choices and messages — and even which invite link each response came from.' },
  { q: 'Can I change my theme later?', a: 'Any time. Switching themes is a single click and instantly restyles your whole invitation — fonts, colours and all — without touching your content.' },
  { q: 'Who can see my wedding page?', a: 'Only the people you share the link with. Your page stays unpublished until you’re ready, and your data is isolated per couple at the database level.' },
]

function FAQSection() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="bg-land-surface py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-14 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-land-primary">05 — FAQ</span>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl tracking-tight text-land-ink leading-[1.03]">
              Questions, <span className="font-serif italic text-land-primary">answered.</span>
            </h2>
            <p className="mt-5 text-land-muted text-sm leading-relaxed max-w-xs">
              Still curious after this? The fastest answer is to{' '}
              <a href={DEMO_URL} target="_blank" rel="noreferrer" className="text-land-primary font-medium lift-on-hover inline-block">open the demo</a>{' '}and click around.
            </p>
          </div>
        </div>
        <div className="lg:col-span-8">
          <div className="divide-y divide-land-divider border-y border-land-divider">
            {FAQ.map((item, i) => {
              const isOpen = open === i
              return (
                <div key={i}>
                  <button onClick={() => setOpen(isOpen ? -1 : i)} className="w-full flex items-center justify-between gap-4 py-5 text-left">
                    <span className="font-display font-medium text-lg text-land-ink">{item.q}</span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-land-muted transition-transform ${isOpen ? 'rotate-180 text-land-primary' : ''}`} />
                  </button>
                  <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0'}`}>
                    <p className="overflow-hidden text-land-muted leading-relaxed">{item.a}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   Footer
================================================================ */
function Footer() {
  return (
    <footer className="bg-land-ink text-land-background pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 pb-12 border-b border-land-background/10">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl sm:text-5xl tracking-tight">Wed</span>
              <span className="font-serif italic text-4xl sm:text-5xl text-land-primary-light">Assist</span>
            </div>
            <p className="mt-4 font-serif italic text-land-background/70 text-xl max-w-sm">One link for your whole wedding.</p>
          </div>
          <a href={DEMO_URL} target="_blank" rel="noreferrer" className="magnetic-btn inline-flex items-center gap-2 bg-land-background text-land-ink px-7 py-3.5 rounded-full font-semibold w-fit">
            {CTA_LABEL} <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-land-background/50 text-sm">
          <p className="flex items-center gap-2">
            <span className="relative h-2 w-2 rounded-full bg-emerald-500"><span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" /></span>
            © {new Date().getFullYear()} Wed Assist · Made with care for couples
          </p>
          <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.15em]">
            <a href="#home" className="hover:text-land-background transition-colors">Top</a>
            <a href="#faq" className="hover:text-land-background transition-colors">FAQ</a>
            <a href="https://github.com/Skypherhunt/Wed-Assist" target="_blank" rel="noreferrer" className="hover:text-land-background transition-colors">View source</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ================================================================
   Sticky CTA
================================================================ */
function StickyCTA() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.9)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <>
      <div className={`hidden sm:flex fixed bottom-6 right-6 z-40 items-center gap-4 glass rounded-full pl-5 pr-2 py-2 shadow-xl transition-all duration-500 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}`}>
        <span className="font-display font-medium text-land-ink text-sm">One link for your whole wedding</span>
        <a href={DEMO_URL} target="_blank" rel="noreferrer" className="magnetic-btn inline-flex items-center gap-1.5 bg-land-ink text-land-background px-5 py-2.5 rounded-full font-semibold">{CTA_LABEL} <ArrowUpRight className="h-4 w-4" /></a>
      </div>
      <div className={`sm:hidden fixed bottom-0 inset-x-0 z-40 glass-dark px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] transition-transform duration-500 ${show ? 'translate-y-0' : 'translate-y-full'}`}>
        <a href={DEMO_URL} target="_blank" rel="noreferrer" className="magnetic-btn flex items-center justify-center gap-2 bg-land-primary text-white w-full py-3.5 rounded-full font-semibold">{CTA_LABEL} <ArrowUpRight className="h-4 w-4" /></a>
      </div>
    </>
  )
}

/* ================================================================
   App
================================================================ */
export default function LandingPage() {
  // The app's global smooth-scroll (Lenis, in SmoothScroll.tsx) animates
  // scroll position itself, so ScrollTrigger needs a nudge on every tick to
  // stay in sync (otherwise the pinned tour / draw-on-scroll timeline drift).
  useLenis(() => {
    ScrollTrigger.update()
  })
  useEffect(() => {
    const id = setTimeout(() => ScrollTrigger.refresh(), 400)
    return () => clearTimeout(id)
  }, [])
  return (
    <div className="landing-page relative bg-land-background text-land-ink font-body overflow-x-hidden">
      <div className="noise-overlay" />
      <Navbar />
      <main>
        <Hero />
        <MarqueeBand />
        <ProductTour />
        <Features />
        <Process />
        <StatBand />
        <Testimonial />
        <InviteCTA />
        <FAQSection />
      </main>
      <Footer />
      <StickyCTA />
    </div>
  )
}
