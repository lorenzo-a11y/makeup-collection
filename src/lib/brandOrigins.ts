const RAW: Record<string, string> = {
  // 🇫🇷 France
  "l'oréal": 'FR', "loreal": 'FR', "l'oreal": 'FR',
  "lancôme": 'FR', "lancome": 'FR',
  "yves saint laurent": 'FR', "ysl": 'FR', "ysl beauty": 'FR',
  "dior": 'FR', "christian dior": 'FR', "dior beauty": 'FR',
  "chanel": 'FR',
  "givenchy": 'FR',
  "clarins": 'FR',
  "nuxe": 'FR',
  "la roche-posay": 'FR',
  "vichy": 'FR',
  "bioderma": 'FR',
  "bourjois": 'FR',
  "make up for ever": 'FR',
  "payot": 'FR',
  "caudalie": 'FR',
  "sisley": 'FR', "sisley paris": 'FR',
  "guerlain": 'FR',
  "embryolisse": 'FR',
  "by terry": 'FR',
  "nars": 'FR',
  "sephora collection": 'FR',
  "thierry mugler": 'FR',

  // 🇺🇸 États-Unis
  "nyx": 'US', "nyx professional makeup": 'US', "nyx cosmetics": 'US',
  "hourglass": 'US',
  "westman atelier": 'US',
  "milk": 'US', "milk makeup": 'US',
  "urban decay": 'US',
  "mac": 'US', "mac cosmetics": 'US',
  "benefit": 'US', "benefit cosmetics": 'US',
  "too faced": 'US',
  "tarte": 'US', "tarte cosmetics": 'US',
  "fenty beauty": 'US',
  "kylie cosmetics": 'US',
  "colourpop": 'US',
  "e.l.f.": 'US', "elf": 'US', "e.l.f. cosmetics": 'US',
  "maybelline": 'US', "maybelline new york": 'US',
  "covergirl": 'US',
  "revlon": 'US',
  "opi": 'US',
  "clinique": 'US',
  "estée lauder": 'US', "estee lauder": 'US',
  "bobbi brown": 'US',
  "tom ford": 'US', "tom ford beauty": 'US',
  "marc jacobs beauty": 'US',
  "laura mercier": 'US',
  "smashbox": 'US',
  "bareminerals": 'US', "bare minerals": 'US',
  "it cosmetics": 'US',
  "anastasia beverly hills": 'US', "abh": 'US',
  "morphe": 'US',
  "wet n wild": 'US',
  "l.a. girl": 'US',
  "glow recipe": 'US',
  "tatcha": 'US',
  "ilia": 'US',
  "rms beauty": 'US',
  "kosas": 'US',
  "rare beauty": 'US',
  "glossier": 'US',
  "natasha denona": 'US',
  "mary kay": 'US',
  "neutrogena": 'US',
  "physicians formula": 'US',
  "hard candy": 'US',
  "ofra": 'US',
  "lorac": 'US',
  "tower 28": 'US',

  // 🇬🇧 Royaume-Uni
  "charlotte tilbury": 'GB',
  "refy": 'GB',
  "lisa eldridge": 'GB',
  "bybi": 'GB',
  "rimmel": 'GB', "rimmel london": 'GB',
  "barry m": 'GB',
  "pixi": 'GB',
  "trinny london": 'GB',
  "illamasqua": 'GB',
  "revolution": 'GB', "makeup revolution": 'GB',
  "nip+fab": 'GB',
  "eyeko": 'GB',
  "mua": 'GB',
  "medik8": 'GB',
  "w7": 'GB',

  // 🇮🇹 Italie
  "kiko": 'IT', "kiko milano": 'IT',
  "giorgio armani": 'IT', "armani beauty": 'IT', "armani": 'IT',
  "dolce & gabbana": 'IT', "dolce and gabbana": 'IT',
  "pupa": 'IT', "pupa milano": 'IT',
  "deborah milano": 'IT',
  "diego dalla palma": 'IT',
  "borghese": 'IT',

  // 🇰🇷 Corée du Sud
  "beauty of joseon": 'KR',
  "laneige": 'KR',
  "innisfree": 'KR',
  "cosrx": 'KR',
  "missha": 'KR',
  "etude house": 'KR', "etude": 'KR',
  "tony moly": 'KR', "tonymoly": 'KR',
  "rom&nd": 'KR', "romand": 'KR',
  "peripera": 'KR',
  "3ce": 'KR',
  "moonshot": 'KR',
  "clio": 'KR',
  "hera": 'KR',
  "vt cosmetics": 'KR',
  "anua": 'KR',
  "some by mi": 'KR',
  "i'm from": 'KR', "im from": 'KR',
  "isntree": 'KR',
  "torriden": 'KR',
  "skin1004": 'KR',
  "dr. jart+": 'KR', "dr jart": 'KR', "dr. jart": 'KR',
  "belif": 'KR',
  "sulwhasoo": 'KR',
  "ahc": 'KR',
  "purito": 'KR',
  "klairs": 'KR', "dear klairs": 'KR',
  "papa recipe": 'KR',
  "benton": 'KR',
  "round lab": 'KR',
  "numbuzin": 'KR',
  "ma:nyo": 'KR',
  "abib": 'KR',
  "medicube": 'KR',
  "neogen": 'KR',
  "the face shop": 'KR',
  "nature republic": 'KR',
  "holika holika": 'KR',
  "skinfood": 'KR', "skin food": 'KR',
  "too cool for school": 'KR',

  // 🇩🇪 Allemagne
  "essence": 'DE',
  "catrice": 'DE',
  "p2 cosmetics": 'DE',
  "artdeco": 'DE',
  "nivea": 'DE',
  "eucerin": 'DE',
  "manhattan": 'DE',

  // 🇯🇵 Japon
  "shiseido": 'JP',
  "sk-ii": 'JP', "sk ii": 'JP',
  "suqqu": 'JP',
  "rmk": 'JP',
  "shu uemura": 'JP',
  "kanebo": 'JP',
  "cosme decorte": 'JP',
  "ipsa": 'JP',
  "addiction": 'JP',
  "kate": 'JP', "kate tokyo": 'JP',
  "majolica majorca": 'JP',
  "cezanne": 'JP',
  "canmake": 'JP',

  // 🇨🇦 Canada
  "bite beauty": 'CA',
  "nudestix": 'CA',
  "cover fx": 'CA',
  "lise watier": 'CA',

  // 🇦🇺 Australie
  "nude by nature": 'AU',
  "modelco": 'AU',
  "ere perez": 'AU',

  // 🇸🇪 Suède
  "isadora": 'SE',
  "oriflame": 'SE',

  // 🇳🇱 Pays-Bas
  "rituals": 'NL',

  // 🇨🇭 Suisse
  "la prairie": 'CH',
  "valmont": 'CH',

  // 🇮🇪 Irlande
  "sculpted by aimee": 'IE',

  // 🇪🇸 Espagne
  "lola make up": 'ES',
}

const NORMALIZED = new Map(
  Object.entries(RAW).map(([k, v]) => [k.toLowerCase().trim(), v])
)

export function getBrandCountry(brand: string): string | null {
  const q = brand.toLowerCase().trim()
  if (NORMALIZED.has(q)) return NORMALIZED.get(q)!
  for (const [key, val] of NORMALIZED) {
    if (q.includes(key) || key.includes(q)) return val
  }
  return null
}
