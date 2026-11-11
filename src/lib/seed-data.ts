import type { Market, Vendor } from '@/types';

/**
 * Vans listed on the site.
 *
 * Empty until real Tasmanian vendors sign up. The made-up sample vans, ratings
 * and reviews from the original build have been removed so nothing fake is
 * shown to the public. When the vendor database arrives (Phase 2) this list
 * will come from Supabase instead.
 */
export const SEED_VENDORS: Vendor[] = [];

/**
 * Tasmanian markets where food vans trade.
 * Days, times and addresses checked against the markets' own listings,
 * Discover Tasmania and City of Hobart on 3 Nov 2026. Recheck each season.
 */
export const SEED_MARKETS: Market[] = [
  {
    id: 'm1',
    name: 'Salamanca Market',
    slug: 'salamanca-market',
    description:
      'Over 300 stalls along historic Salamanca Place every Saturday, rain, hail or shine, with plenty of hot food and coffee. Owned and run by the City of Hobart.',
    location_name: 'Salamanca Place',
    suburb: 'Hobart',
    state: 'TAS',
    lat: -42.8867,
    lng: 147.3339,
    frequency: 'Weekly',
    day_of_week: 'Every Saturday, 8.30am - 3pm',
    website_url: 'https://www.salamancamarket.com.au',
  },
  {
    id: 'm2',
    name: 'Farm Gate Market',
    slug: 'farm-gate-market',
    description:
      'Hobart\'s Sunday farmers\' market on Bathurst Street, with rotating street food vendors and the Grub Hub serving breakfast from 8am.',
    location_name: '104 Bathurst Street',
    suburb: 'Hobart',
    state: 'TAS',
    lat: -42.8814,
    lng: 147.3254,
    frequency: 'Weekly',
    day_of_week: 'Every Sunday, 8.30am - 1pm',
    website_url: 'https://www.farmgatemarket.com.au',
  },
  {
    id: 'm3',
    name: 'Street Eats @ Franko',
    slug: 'street-eats-franko',
    description:
      'Friday night street food, craft drinks and live music in Franklin Square over the warmer months.',
    location_name: 'Franklin Square, 70 Macquarie Street',
    suburb: 'Hobart',
    state: 'TAS',
    lat: -42.8831,
    lng: 147.3308,
    frequency: 'Seasonal',
    day_of_week: 'Fridays, 4.30pm - 9pm (December to April)',
    website_url: 'https://www.streeteatsfranko.com.au',
  },
  {
    id: 'm4',
    name: 'Hobart Twilight Market',
    slug: 'hobart-twilight-market',
    description:
      'Tasmanian eats, drinks, design and live music on selected Fridays, at Brooke Street Pier or Long Beach in Sandy Bay depending on the season. Check the market\'s website for dates.',
    location_name: 'Brooke Street Pier, 12 Franklin Wharf',
    suburb: 'Hobart',
    state: 'TAS',
    lat: -42.8847,
    lng: 147.3324,
    frequency: 'Selected Fridays',
    day_of_week: 'Selected Fridays, 4.30pm - 9pm',
    website_url: 'https://www.hobarttwilightmarket.com.au',
  },
  {
    id: 'm5',
    name: 'Harvest Launceston Community Farmers\' Market',
    slug: 'harvest-launceston',
    description:
      'Launceston\'s award-winning Saturday farmers\' market in the Cimitiere Street car park, with coffee and food trucks alongside the producers.',
    location_name: '71 Cimitiere Street',
    suburb: 'Launceston',
    state: 'TAS',
    lat: -41.4335,
    lng: 147.1403,
    frequency: 'Weekly',
    day_of_week: 'Every Saturday, 8.30am - 12.30pm',
    website_url: 'https://www.harvestmarket.org.au',
  },
  {
    id: 'm6',
    name: 'Tasmanian Produce Market',
    slug: 'tasmanian-produce-market',
    description:
      'A relaxed Saturday market on the eastern shore at Kangaroo Bay Park, with Tasmanian produce, small-batch drinks, design stalls and a few food trucks. There\'s a playground right next door.',
    location_name: 'Kangaroo Bay Park, 20 Kangaroo Bay Drive',
    suburb: 'Rosny Park',
    state: 'TAS',
    lat: -42.8699,
    lng: 147.3673,
    frequency: 'Weekly',
    day_of_week: 'Every Saturday, 9am - 1pm',
  },
  {
    id: 'm7',
    name: 'Evandale Sunday Market',
    slug: 'evandale-sunday-market',
    description:
      'One of Tasmania\'s longest-running Sunday markets, in historic Evandale about 20 minutes from Launceston. Food vans, local produce, crafts, second-hand finds and pony rides for the kids.',
    location_name: 'Falls Park, Logan Road',
    suburb: 'Evandale',
    state: 'TAS',
    lat: -41.5710,
    lng: 147.2541,
    frequency: 'Weekly',
    day_of_week: 'Every Sunday, 8am - 1.30pm',
    website_url: 'https://www.facebook.com/EvandaleSundayMarket',
  },
  {
    id: 'm8',
    name: 'World Street Eats',
    slug: 'world-street-eats',
    description:
      'Launceston\'s monthly multicultural street food market in Civic Square, with food from around the world, live performances and plenty of space to sit. Check the market\'s website for dates.',
    location_name: 'Civic Square',
    suburb: 'Launceston',
    state: 'TAS',
    lat: -41.4384,
    lng: 147.1392,
    frequency: 'Monthly',
    day_of_week: 'One Sunday a month, 11am - 3pm',
    website_url: 'https://www.worldstreeteats.com.au',
  },
  {
    id: 'm9',
    name: 'Devonport Twilight Market',
    slug: 'devonport-twilight-market',
    description:
      'A monthly Friday night market in and around the heated Market Square Pavilion, with local makers inside and around 15 street food vendors out in the square. On rain, hail or shine.',
    location_name: 'Market Square Pavilion, 13-17 Oldaker Street',
    suburb: 'Devonport',
    state: 'TAS',
    lat: -41.1766,
    lng: 146.3605,
    frequency: 'Monthly',
    day_of_week: 'One Friday a month, 4pm - 8pm',
    website_url: 'https://www.facebook.com/devonporttwilightmarket',
  },
  // m10 - m12 added 11 Nov 2026 from the markets' Facebook event listings.
  {
    id: 'm10',
    name: 'Penguin Twilight Market',
    slug: 'penguin-twilight-market',
    description:
      'A Saturday evening market at the Penguin Football Club, run by Tassie Market Trail, with local makers and food. Held on selected dates - check Tassie Market Trail on Facebook for the next one.',
    location_name: 'Penguin Football Club, 1 Dial Park Drive',
    suburb: 'Penguin',
    state: 'TAS',
    lat: -41.127,
    lng: 146.0716,
    frequency: 'Selected Saturdays',
    day_of_week: 'Selected Saturdays, 4pm - 8pm',
  },
  {
    id: 'm11',
    name: 'Banksia Makers Market',
    slug: 'banksia-makers-market',
    description:
      'A monthly makers market at Camp Banksia in Port Sorell, with stalls of handcrafted goods from local makers.',
    location_name: 'Camp Banksia, 1 Anderson Street',
    suburb: 'Port Sorell',
    state: 'TAS',
    lat: -41.1619,
    lng: 146.5488,
    frequency: 'Monthly',
    day_of_week: 'Second Saturday of the month, 9.30am - 1.30pm',
  },
  {
    id: 'm12',
    name: 'Ulverstone Market',
    slug: 'ulverstone-market',
    description:
      'A Saturday market at the Ulverstone Rowing Club on Kings Parade, with food stalls and local makers. Check Ulverstone Market on Facebook for dates.',
    location_name: 'Ulverstone Rowing Club, Kings Parade',
    suburb: 'Ulverstone',
    state: 'TAS',
    lat: -41.1583,
    lng: 146.1637,
    frequency: 'Selected Saturdays',
    day_of_week: 'Selected Saturdays, 10am - 2pm',
  },
];
