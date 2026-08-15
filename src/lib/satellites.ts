export interface Satellite {
  id: string;
  name: string;
  launched: string;
  agency: string;
  milestone: string;
  image: string;
  source: string;
  license: string;
}

export const SATELLITES: Satellite[] = [
  {
    id: 'explorer-1',
    name: 'Explorer-1',
    launched: '1958-02-01',
    agency: 'USA · NASA/JPL',
    milestone: 'First US satellite; discovered the Van Allen radiation belts',
    image: '/satellites/explorer-1.png',
    source: "https://commons.wikimedia.org/wiki/File:America's_First_Satellite_(Explorer_1).jpg",
    license: 'Public domain (NASA)',
  },
  {
    id: 'hubble',
    name: 'Hubble',
    launched: '1990-04-24',
    agency: 'NASA / ESA',
    milestone: 'Space telescope; in orbit for 35+ years of observations',
    image: '/satellites/hubble.png',
    source: 'https://commons.wikimedia.org/wiki/File:Hubble_2009_close-up.jpg',
    license: 'Public domain (NASA)',
  },
] as const;
