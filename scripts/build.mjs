import { mkdir, cp, writeFile, rm, access } from 'node:fs/promises';
import { event, copy } from '../src/event.mjs';

const out = new URL('../dist/', import.meta.url);
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(new URL('../public/', import.meta.url), out, { recursive: true });
const routes = ['index', 'evening', 'visit', 'partners'];
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const lines = text => text.split('\n').map(esc).join('<br> ');
const star = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 1.5 14.6 9.4 22.5 12 14.6 14.6 12 22.5 9.4 14.6 1.5 12 9.4 9.4Z" fill="currentColor"/></svg>';
const arrow = '<span aria-hidden="true">↗</span>';
function safeURL(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error(`Only HTTPS links are accepted: ${value}`);
  return esc(url.href);
}
for (const item of event.sponsors) {
  if (!item.name?.zh || !item.name?.en || !item.logoFile) throw new Error('Every confirmed partner needs bilingual names and a logo file');
  if (item.url) safeURL(item.url);
  for (const file of [item.logoFile,item.bannerFile].filter(Boolean)) {
    if (!/^[a-zA-Z0-9_.]+\.(png|jpg|jpeg|webp|svg)$/.test(file)) throw new Error('Use a simple asset filename without a path');
    await access(new URL(`../public/assets/${file}`,import.meta.url));
  }
}
if(event.registrationURL) safeURL(event.registrationURL);

for (const locale of ['zh', 'en']) {
  const t = copy[locale];
  const prefix = locale === 'en' ? '../' : '';
  const asset = file => `${prefix}assets/${file}`;
  const link = (route, hash = '') => `${route}.html${hash}`;
  const button = (text, url, kind = '') => `<a class="button ${kind}" href="${esc(url)}">${esc(text)}${arrow}</a>`;
  const status = () => event.registrationURL
    ? button(t.register, event.registrationURL)
    : `<p class="status"><span class="status-dot" aria-hidden="true"></span>${esc(t.pending)}</p>`;
  const photo = (name, alt, extra = '') => `<img src="${asset(`${name}-960.webp`)}" srcset="${asset(`${name}-640.webp`)} 640w, ${asset(`${name}-960.webp`)} 960w, ${asset(`${name}-1440.webp`)} 1440w" sizes="(max-width: 700px) 100vw, 55vw" width="1440" height="958" alt="${esc(alt)}" loading="lazy" decoding="async" ${extra}>`;
  const dateBadge = () => `<div class="art-date"><span class="art-date-label">${esc(t.artDateLabel)}</span><strong>${event.dateISO.slice(5).replace('-', '.')}</strong><span class="art-date-time">${esc(t.time)}</span><span class="art-date-venue">${esc(t.venue)}</span></div>`;
  const panorama = (modal = false) => `<div class="panorama${modal ? ' panorama-full' : ''}">
    ${['garden','title','castle'].map((name,i) => `<div class="art-panel"><img src="${asset(`${name}-900.webp`)}" srcset="${asset(`${name}-540.webp`)} 540w, ${asset(`${name}-900.webp`)} 900w" sizes="(max-width: 700px) 80vw, 34vw" width="1080" height="1350" alt="${esc(t.artAlts[i])}" ${modal ? 'loading="lazy"' : 'fetchpriority="high"'}>${i === 2 ? dateBadge() : ''}</div>`).join('')}
    </div>`;
  const banner = () => {
    const banners = event.sponsors.filter(s => s.bannerFile);
    if (banners.length) return `<section class="sponsor-banners wrap" aria-label="${esc(t.homeBannerLabel)}">${banners.map(s => `<a href="${s.url ? safeURL(s.url) : link('partners')}"${s.url ? ' target="_blank" rel="noopener noreferrer"' : ''}><img src="${asset(s.bannerFile)}" alt="${esc(s.bannerAlt?.[locale] || s.name[locale])}" loading="lazy"></a>`).join('')}</section>`;
    return `<section class="partnership-band wrap" aria-labelledby="banner-title"><div class="band-star">${star}</div><div><p class="eyebrow">${t.homeBannerLabel}</p><h2 id="banner-title">${t.homeBannerTitle}</h2><p>${t.homeBannerText}</p></div><a class="text-link" href="${link('partners')}">${t.homeBannerCTA}${arrow}</a></section>`;
  };
  const intro = (kicker, title, description) => `<header class="page-intro wrap"><p class="eyebrow">${esc(kicker)}</p><h1>${lines(title)}</h1><p class="intro-copy">${esc(description)}</p></header>`;
  const pageContent = {
    index: `<section class="hero" aria-labelledby="hero-title">
      <div class="hero-topline wrap"><div class="hero-facts"><span>${esc(t.organizerShort)}</span><span><time datetime="${event.dateISO}">${esc(t.dateShort)}</time> · ${esc(t.time)}</span><span>${esc(t.venue)} · ${esc(t.room)}</span></div><a class="hero-quicklink" href="${link('visit')}">${esc(t.visitCTA)}${arrow}</a></div>
      <div class="panorama-shell"><div class="panorama-scroll" tabindex="0" role="region" aria-label="${esc(t.artLabel)}">${panorama()}</div></div>
      <div class="art-toolbar wrap"><span class="art-hint">${esc(t.artHint)}</span><div class="art-buttons"><button class="scene-arrow" data-direction="previous" aria-label="${esc(t.previous)}">←</button><button class="scene-arrow" data-direction="next" aria-label="${esc(t.next)}">→</button></div><button class="art-open text-link" data-open-art>${esc(t.fullArt)}<span aria-hidden="true">＋</span></button></div>
      <div class="hero-caption wrap"><div><p class="eyebrow">${t.heroKicker}</p><h1 id="hero-title">${t.heroLine.map(esc).join('<br>')}</h1></div><div class="hero-copy"><p>${esc(t.intro)}</p><div class="hero-actions">${button(t.visitCTA, link('visit'))}${status()}</div></div></div>
    </section>
    <section class="invitation wrap section-space"><div class="section-number">01<span aria-hidden="true"></span></div><div class="invitation-heading"><p class="eyebrow">${t.homeEyebrow}</p><h2>${lines(t.homeHeading)}</h2></div><div class="invitation-copy"><p>${t.homeBody}</p><ul class="feature-list">${t.featureNames.map((s,i) => `<li><span>0${i+1}</span>${esc(s)}</li>`).join('')}</ul><a class="text-link" href="${link('evening')}">${t.eveningCTA}${arrow}</a></div></section>
    <section class="archive section-space" aria-labelledby="archive-title"><div class="archive-top wrap"><div><p class="eyebrow">${t.archiveKicker}</p><h2 id="archive-title">${lines(t.archiveTitle)}</h2></div><p>${t.archiveBody}</p></div><div class="archive-gallery wrap"><figure class="archive-large">${photo('group', t.photoAlts.group)}<figcaption>${t.archiveCaption}</figcaption></figure><figure class="archive-small">${photo('crowd', t.photoAlts.crowd)}<figcaption aria-hidden="true">2025 · CHRISTMAS MEMORIES</figcaption></figure></div></section>
    ${banner()}
    <dialog class="art-dialog" aria-label="${esc(t.artLabel)}"><div class="dialog-toolbar"><span>${esc(t.artLabel)}</span><button data-close-art aria-label="${esc(t.closeArt)}">${esc(t.closeArt)} <span aria-hidden="true">×</span></button></div>${panorama(true)}<p>${esc(t.date)} · ${esc(t.time)} · ${esc(t.venue)}</p></dialog>`,
    evening: `${intro(t.eveningKicker, t.eveningTitle, t.eveningIntro)}
      <section class="program wrap"><div class="section-heading"><h2>${t.programLabel}</h2><span>${t.time}</span></div><ol class="program-list">${t.stages.map((stage,i) => `<li><span class="program-number">0${i+1}</span><div class="program-name"><span>${esc(stage[0])}</span><h3>${esc(stage[1])}</h3></div><p>${esc(stage[2])}</p>${star}</li>`).join('')}</ol><p class="fine-print">${t.programNote}</p></section>
      <section class="evening-photo wrap section-space"><figure>${photo('friends', t.photoAlts.friends)}<figcaption>${t.archiveCaption}</figcaption></figure><div><p class="eyebrow">2026 CHRISTMAS BALL</p><h2>${t.eveningCallout}</h2><p>${t.eveningCalloutText}</p>${button(t.visitCTA, link('visit'))}</div></section>`,
    visit: `${intro(t.visitKicker,t.visitTitle,t.visitIntro)}
      <section class="visit-layout wrap"><div class="invitation-ticket"><div class="ticket-heading">${star}<span>CHRISTMAS EVE · 2026</span>${star}</div><dl class="event-details">${[t.date,`${t.time} (${t.timeZone})`,`${t.venue} · ${t.room}`,t.audience].map((value,i) => `<div><dt>${t.detailsLabels[i]}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><span class="ticket-bottom">${esc(t.name)}</span></div><div class="registration" id="registration"><p class="eyebrow">REGISTRATION</p><h2>${t.registrationTitle}</h2>${status()}<p>${event.registrationURL ? t.registrationNote : t.registrationBody}</p></div></section>
      <section class="location wrap section-space"><div class="location-heading"><span class="section-number">02</span><h2>${t.locationTitle}</h2></div><div><h3>${t.venue} <span>${t.room}</span></h3><p class="address">${esc(t.address)}</p><p>${t.locationBody}</p><div class="location-links">${button(t.mapCTA,event.mapURL,'button-outline')}<a class="text-link" href="${safeURL(event.venueURL)}" target="_blank" rel="noopener noreferrer">${t.transportCTA}${arrow}</a></div></div></section>
      <section class="faq wrap section-space"><div><p class="eyebrow">GOOD TO KNOW</p><h2>${t.faqTitle}</h2></div><div class="faq-list">${t.faqs.map(([q,a]) => `<details><summary>${esc(q)}<span aria-hidden="true">＋</span></summary><p>${esc(a)}</p></details>`).join('')}</div></section>`,
    partners: `${intro(t.partnerKicker,t.partnerTitle,t.partnerIntro)}
      <section class="partners wrap" aria-labelledby="partners-title"><div class="section-heading"><h2 id="partners-title">${t.partnerListTitle}</h2>${star}</div>${event.sponsors.length ? `<div class="partner-grid">${event.sponsors.map(s => `<article class="partner-card"><img src="${asset(s.logoFile)}" alt="${esc(s.name[locale])}" width="320" height="180" loading="lazy"><h3>${esc(s.name[locale])}</h3>${s.description?.[locale] ? `<p>${esc(s.description[locale])}</p>` : ''}${s.url ? `<a class="text-link" href="${safeURL(s.url)}" target="_blank" rel="noopener noreferrer">${t.imageLink}${arrow}</a>` : ''}</article>`).join('')}</div>` : `<div class="partners-empty"><div class="empty-star">${star}</div><h3>${t.partnerEmptyTitle}</h3><p>${t.partnerEmptyBody}</p></div>`}</section>
      <section class="partnership-detail wrap section-space"><div><p class="eyebrow">LET’S MAKE IT HAPPEN</p><h2>${t.partnershipTitle}</h2><p>${t.partnershipBody}</p></div><ol>${t.partnershipWays.map(([title,body],i) => `<li><span>0${i+1}</span><div><h3>${title}</h3><p>${body}</p></div></li>`).join('')}</ol><p class="contact-note">${event.contactEmail ? `<a class="text-link" href="mailto:${esc(event.contactEmail)}">${t.contactCTA}${arrow}</a>` : t.contactPending}</p></section>
      <section class="organizers wrap section-space"><p class="eyebrow">BEHIND THE EVENING</p><h2>${t.organizerTitle}</h2><ul>${t.departments.map(name => `<li>${esc(name)}</li>`).join('')}</ul></section>`,
  };

  for (const [pageIndex, route] of routes.entries()) {
    const otherLanguage = locale === 'zh' ? `en/${route}.html` : `../${route}.html`;
    const canonical = new URL(`${locale === 'en' ? 'en/' : ''}${route === 'index' ? '' : `${route}.html`}`, event.siteURL).href;
    const title = `${route === 'index' ? t.name : `${t.nav[pageIndex]}｜${t.name}`} · 2026`;
    const html = `<!doctype html>
<html lang="${t.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#172239"><title>${esc(title)}</title><meta name="description" content="${esc(t.meta)}"><link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="zh-Hant" href="${new URL(route === 'index' ? '' : `${route}.html`,event.siteURL)}"><link rel="alternate" hreflang="en" href="${new URL(`en/${route === 'index' ? '' : `${route}.html`}`,event.siteURL)}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(t.meta)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${new URL('assets/title-900.webp',event.siteURL)}"><meta property="og:image:width" content="900"><meta property="og:image:height" content="1125"><link rel="icon" href="${asset('avatar.png')}" type="image/png"><link rel="preload" href="${asset('noto-serif-tc.woff2')}" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="${prefix}style.css"><script src="${prefix}app.js" defer></script></head>
<body class="page-${route}"><a class="skip-link" href="#main">${t.skip}</a>
<header class="site-header" id="top"><div class="nav-shell"><a class="brand" href="${link('index')}" aria-label="${esc(t.name)}"><img src="${asset('avatar.png')}" alt="" width="48" height="48"><span>${esc(t.shortName)}<small>NSYSU CHRISTMAS BALL</small></span></a><nav class="site-nav" id="site-nav" aria-label="${locale === 'zh' ? '主要導覽' : 'Main navigation'}">${routes.map((r,i) => `<a href="${link(r)}"${r === route ? ' aria-current="page"' : ''}>${t.nav[i]}</a>`).join('')}</nav><div class="nav-controls"><a class="language-switch" href="${otherLanguage}" lang="${locale === 'zh' ? 'en' : 'zh-Hant'}" aria-label="${t.langLabel}">${t.langButton}<span aria-hidden="true">↗</span></a><button class="menu-toggle" aria-controls="site-nav" aria-expanded="false" aria-label="${t.menu}" data-open-label="${t.menu}" data-close-label="${t.closeMenu}"><span></span><span></span></button></div></div></header>
<main id="main">${pageContent[route]}</main>
<footer class="site-footer"><div class="footer-main wrap"><div class="footer-brand">${star}<p>${esc(t.footerLine)}</p><span>${esc(t.organizer)}</span></div><div class="footer-info"><span>${event.dateISO.replaceAll('-', '.')}</span><span>${t.time} · ${t.timeZone}</span><span>${t.venue} · ${t.room}</span></div></div><div class="footer-bottom wrap"><span>© 2026 NSYSU CHRISTMAS BALL</span>${event.instagramURL ? `<a href="${safeURL(event.instagramURL)}">Instagram ${arrow}</a>` : `<span>${t.footerStatus}</span>`}<a href="#top">${t.backTop} ↑</a></div></footer>
</body></html>`;
    const dir = new URL(locale === 'en' ? 'en/' : './',out);
    await mkdir(dir,{recursive:true});
    await writeFile(new URL(`${route}.html`,dir),html);
  }
}
await writeFile(new URL('.nojekyll',out),'');
await writeFile(new URL('robots.txt',out),`User-agent: *\nAllow: /\nSitemap: ${event.siteURL}sitemap.xml\n`);
await writeFile(new URL('sitemap.xml',out),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['','en/'].flatMap(lang => routes.map(r=>`<url><loc>${event.siteURL}${lang}${r === 'index' ? '' : `${r}.html`}</loc></url>`)).join('')}</urlset>`);
console.log('Built 8 complete pages with Traditional Chinese and English content.');
