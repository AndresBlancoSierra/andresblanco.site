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
    id: 'sputnik-1',
    name: 'Sputnik-1',
    launched: '1957-10-04',
    agency: 'Soviet Union',
    milestone: 'First artificial satellite in orbit (58 cm sphere, 4 whip antennas)',
    image: '/satellites/sputnik.png',
    source:
      'https://commons.wikimedia.org/wiki/File:Sputnik_1_Exploded_View_3F9A6199_(36924864550)_modified.png',
    license: 'CC0',
  },
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
    id: 'vanguard-1',
    name: 'Vanguard-1',
    launched: '1958-03-17',
    agency: 'USA · US Navy',
    milestone: 'Second US satellite; the oldest object still in orbit',
    image: '/satellites/vanguard-1.png',
    source: 'https://commons.wikimedia.org/wiki/File:VANGUARD_1_(satellite).jpg',
    license: 'CC BY 4.0',
  },
  {
    id: 'telstar-1',
    name: 'Telstar-1',
    launched: '1962-07-10',
    agency: 'USA · Bell Labs/AT&T',
    milestone: 'First active communications satellite; first live transatlantic TV',
    image: '/satellites/telstar-1.png',
    source: 'https://commons.wikimedia.org/wiki/File:Telstar.jpg',
    license: 'Public domain',
  },
  {
    id: 'skylab',
    name: 'Skylab',
    launched: '1973-05-14',
    agency: 'USA · NASA',
    milestone: 'First US space station; crewed by three missions (1973–1974)',
    image: '/satellites/skylab.png',
    source: 'https://commons.wikimedia.org/wiki/File:Skylab_and_Earth_Limb_-_GPN-2000-001055.jpg',
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
  {
    id: 'iss',
    name: 'International Space Station',
    launched: '1998-11-20',
    agency: 'USA · Russia · EU · Japan · Canada',
    milestone: 'Largest human-made object in orbit (assembly began 1998)',
    image: '/satellites/iss.png',
    source:
      'https://commons.wikimedia.org/wiki/File:STS-134_International_Space_Station_after_undocking.jpg',
    license: 'Public domain (NASA)',
  },
] as const;
