'use client';

import Link from 'next/link';

const IconBook = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const IconDocument = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);

const IconQuestion = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconChevronRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const IconExternalLink = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

const ITEMS = [
  { icon: <IconBook />, title: 'Rider Onboarding Guide', desc: 'Learn how to onboard a new rider', href: '/knowledge/onboarding' },
  { icon: <IconDocument />, title: 'Ride Policies & Guidelines', desc: 'View policies and important guidelines', href: '/knowledge/policies' },
  { icon: <IconQuestion />, title: 'FAQ', desc: 'Get answers to common questions', href: '/knowledge/faq' },
];

export default function KnowledgeResources() {
  return (
    <div className="panel-card">
      <div className="panel-card-header">
        <div className="panel-card-title">Knowledge &amp; Resources</div>
      </div>

      <div className="knowledge-list">
        {ITEMS.map((item) => (
          <Link key={item.title} href={item.href} className="knowledge-item">
            <div className="knowledge-item-icon">{item.icon}</div>
            <div className="knowledge-item-text">
              <div className="knowledge-item-title">{item.title}</div>
              <div className="knowledge-item-desc">{item.desc}</div>
            </div>
            <span className="knowledge-chevron"><IconChevronRight /></span>
          </Link>
        ))}
      </div>

      <div className="knowledge-footer">
        <Link href="/knowledge">
          Visit Knowledge Base <IconExternalLink />
        </Link>
      </div>
    </div>
  );
}
