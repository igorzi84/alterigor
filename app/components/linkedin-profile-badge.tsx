'use client';

import { useEffect } from 'react';

import { useInsights } from './insights';

const linkedInBadgeScript =
  'https://platform.linkedin.com/badges/js/profile.js';

export function LinkedInProfileBadge({
  className = 'mt-8',
}: {
  className?: string;
}) {
  const { track } = useInsights();

  useEffect(() => {
    if (document.querySelector(`script[src="${linkedInBadgeScript}"]`)) {
      return;
    }

    const script = document.createElement('script');
    script.src = linkedInBadgeScript;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className={className}>
      <div
        className="badge-base LI-profile-badge"
        data-locale="en_US"
        data-size="medium"
        data-theme="dark"
        data-type="VERTICAL"
        data-vanity="igorzi"
        data-version="v1"
        onClick={() => track('linkedin_click')}
      >
        <a
          className="badge-base__link LI-simple-link"
          href="https://ca.linkedin.com/in/igorzi?trk=profile-badge"
        >
          Igor Zilberman
        </a>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-400">
        This profile badge is provided by LinkedIn. Loading it may share browser
        information with LinkedIn.
      </p>
    </div>
  );
}
