import { feature } from 'topojson-client'

const TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// Continent lookup by numeric ISO-3166 code. Static table — covers ~all
// countries in world-atlas. Falls through to "—" for missing entries.
const CONTINENT = {
  AF: new Set(['012','024','072','086','108','120','132','140','148','174','178','180','204','226','231','232','262','266','270','288','324','384','404','426','430','434','450','454','466','478','480','504','508','516','562','566','624','646','678','686','690','694','706','710','716','728','729','732','736','748','768','788','800','818','834','854','894']),
  EU: new Set(['008','020','040','056','070','100','112','191','196','203','208','233','234','246','250','268','276','292','300','336','348','352','372','380','428','438','440','442','470','492','498','499','528','578','616','620','642','643','674','688','703','705','724','752','756','804','807','826','831','832','833']),
  AS: new Set(['004','031','048','050','051','064','096','104','144','156','158','196','268','275','344','356','360','364','368','376','392','398','400','408','410','414','417','418','422','446','458','462','496','512','524','586','608','634','643','682','686','699','702','704','760','762','764','784','792','795','860','887']),
  NA: new Set(['028','044','052','060','068','084','092','124','136','188','192','212','214','308','312','316','320','332','340','388','474','484','500','531','533','558','591','630','638','659','660','662','663','666','670','780','796','840','850','882']),
  SA: new Set(['032','068','076','152','170','218','238','254','328','531','591','600','604','740','858','862']),
  OC: new Set(['016','036','090','184','242','258','296','316','334','520','540','548','554','570','574','580','581','583','584','585','598','612','772','776','798','876','882']),
}
const CONTINENT_NAME = { AF: 'Africa', EU: 'Europe', AS: 'Asia', NA: 'North America', SA: 'South America', OC: 'Oceania' }

export function continentOf(id) {
  const key = String(id).padStart(3, '0')
  for (const [k, set] of Object.entries(CONTINENT)) {
    if (set.has(key)) return CONTINENT_NAME[k]
  }
  return '—'
}

// Load world-atlas TopoJSON and convert to GeoJSON FeatureCollection.
// Each feature.id is the numeric ISO-3166 code (e.g. "840" for USA).
export async function loadCountryData() {
  const res = await fetch(TOPO_URL)
  if (!res.ok) throw new Error('Failed to fetch country topojson')
  const topo = await res.json()
  const fc = feature(topo, topo.objects.countries)
  // Normalize feature.id to string for consistent key comparisons.
  for (const f of fc.features) f.id = String(f.id)
  return fc
}
