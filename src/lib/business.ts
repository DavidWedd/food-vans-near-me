/** Business details used in the footer, legal pages and contact page. Change them here only. */
export const BUSINESS = {
  tradingName: 'Food Vans Near Me',
  legalName: 'Virmo Pty Ltd',
  abn: '78 698 605 784',
  acn: '698 605 784',
  email: 'hello@foodvansnear.me',
  postalAddress: 'PO Box 44, Sandy Bay TAS',
  state: 'Tasmania',
  website: 'https://foodvansnear.me',
  gstRegistered: true,
} as const;

export const BUSINESS_LINE = `${BUSINESS.tradingName} is a division of ${BUSINESS.legalName}, ABN ${BUSINESS.abn}`;

/** Until vendor sign-up is built, founding-vendor enquiries go by email. */
export const FOUNDING_SPOT_MAILTO = `mailto:${BUSINESS.email}?subject=${encodeURIComponent(
  'Founding vendor spot - Food Vans Near Me'
)}&body=${encodeURIComponent(
  'Hi,\n\nI\'d like to claim a founding vendor spot.\n\nBusiness name:\nWhat we sell:\nUsual trading spots and days:\nBest phone number:\nInstagram or Facebook (if any):\n\nThanks!'
)}`;

export const LEGAL_LAST_UPDATED = '5 November 2026';
