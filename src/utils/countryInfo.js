// Country info keyed by numeric ISO-3166-1 code (matches world-atlas feature.id).
// Format: [alpha2, capital, currency]
// Flag emoji is derived from alpha2 via regional-indicator codepoints.
// Compact data — covers most countries. Missing entries fall back gracefully.

const RAW = {
  '004': ['AF','Kabul','AFN'],          '008': ['AL','Tirana','ALL'],          '012': ['DZ','Algiers','DZD'],
  '020': ['AD','Andorra la Vella','EUR'],'024': ['AO','Luanda','AOA'],         '028': ['AG','Saint John’s','XCD'],
  '031': ['AZ','Baku','AZN'],           '032': ['AR','Buenos Aires','ARS'],    '036': ['AU','Canberra','AUD'],
  '040': ['AT','Vienna','EUR'],         '044': ['BS','Nassau','BSD'],          '048': ['BH','Manama','BHD'],
  '050': ['BD','Dhaka','BDT'],          '051': ['AM','Yerevan','AMD'],         '052': ['BB','Bridgetown','BBD'],
  '056': ['BE','Brussels','EUR'],       '060': ['BM','Hamilton','BMD'],        '064': ['BT','Thimphu','BTN'],
  '068': ['BO','Sucre','BOB'],          '070': ['BA','Sarajevo','BAM'],        '072': ['BW','Gaborone','BWP'],
  '076': ['BR','Brasília','BRL'],       '084': ['BZ','Belmopan','BZD'],        '086': ['IO','Diego Garcia','USD'],
  '090': ['SB','Honiara','SBD'],        '096': ['BN','Bandar Seri Begawan','BND'],'100':['BG','Sofia','BGN'],
  '104': ['MM','Naypyidaw','MMK'],      '108': ['BI','Gitega','BIF'],          '112': ['BY','Minsk','BYN'],
  '116': ['KH','Phnom Penh','KHR'],     '120': ['CM','Yaoundé','XAF'],         '124': ['CA','Ottawa','CAD'],
  '132': ['CV','Praia','CVE'],          '136': ['KY','George Town','KYD'],     '140': ['CF','Bangui','XAF'],
  '144': ['LK','Sri Jayawardenepura','LKR'],'148':['TD','N’Djamena','XAF'],'152':['CL','Santiago','CLP'],
  '156': ['CN','Beijing','CNY'],        '158': ['TW','Taipei','TWD'],          '170': ['CO','Bogotá','COP'],
  '174': ['KM','Moroni','KMF'],         '178': ['CG','Brazzaville','XAF'],     '180': ['CD','Kinshasa','CDF'],
  '184': ['CK','Avarua','NZD'],         '188': ['CR','San José','CRC'],        '191': ['HR','Zagreb','EUR'],
  '192': ['CU','Havana','CUP'],         '196': ['CY','Nicosia','EUR'],         '203': ['CZ','Prague','CZK'],
  '204': ['BJ','Porto-Novo','XOF'],     '208': ['DK','Copenhagen','DKK'],      '212': ['DM','Roseau','XCD'],
  '214': ['DO','Santo Domingo','DOP'],  '218': ['EC','Quito','USD'],           '222': ['SV','San Salvador','USD'],
  '226': ['GQ','Malabo','XAF'],         '231': ['ET','Addis Ababa','ETB'],     '232': ['ER','Asmara','ERN'],
  '233': ['EE','Tallinn','EUR'],        '234': ['FO','Tórshavn','DKK'],        '242': ['FJ','Suva','FJD'],
  '246': ['FI','Helsinki','EUR'],       '250': ['FR','Paris','EUR'],           '254': ['GF','Cayenne','EUR'],
  '258': ['PF','Papeete','XPF'],        '262': ['DJ','Djibouti','DJF'],        '266': ['GA','Libreville','XAF'],
  '268': ['GE','Tbilisi','GEL'],        '270': ['GM','Banjul','GMD'],          '275': ['PS','Ramallah','ILS'],
  '276': ['DE','Berlin','EUR'],         '288': ['GH','Accra','GHS'],           '292': ['GI','Gibraltar','GIP'],
  '296': ['KI','Tarawa','AUD'],         '300': ['GR','Athens','EUR'],          '304': ['GL','Nuuk','DKK'],
  '308': ['GD','Saint George’s','XCD'],'320':['GT','Guatemala City','GTQ'],'324':['GN','Conakry','GNF'],
  '328': ['GY','Georgetown','GYD'],     '332': ['HT','Port-au-Prince','HTG'],  '336': ['VA','Vatican City','EUR'],
  '340': ['HN','Tegucigalpa','HNL'],    '344': ['HK','Hong Kong','HKD'],       '348': ['HU','Budapest','HUF'],
  '352': ['IS','Reykjavík','ISK'],      '356': ['IN','New Delhi','INR'],       '360': ['ID','Jakarta','IDR'],
  '364': ['IR','Tehran','IRR'],         '368': ['IQ','Baghdad','IQD'],         '372': ['IE','Dublin','EUR'],
  '376': ['IL','Jerusalem','ILS'],      '380': ['IT','Rome','EUR'],            '384': ['CI','Yamoussoukro','XOF'],
  '388': ['JM','Kingston','JMD'],       '392': ['JP','Tokyo','JPY'],           '398': ['KZ','Astana','KZT'],
  '400': ['JO','Amman','JOD'],          '404': ['KE','Nairobi','KES'],         '408': ['KP','Pyongyang','KPW'],
  '410': ['KR','Seoul','KRW'],          '414': ['KW','Kuwait City','KWD'],     '417': ['KG','Bishkek','KGS'],
  '418': ['LA','Vientiane','LAK'],      '422': ['LB','Beirut','LBP'],          '426': ['LS','Maseru','LSL'],
  '428': ['LV','Riga','EUR'],           '430': ['LR','Monrovia','LRD'],        '434': ['LY','Tripoli','LYD'],
  '438': ['LI','Vaduz','CHF'],          '440': ['LT','Vilnius','EUR'],         '442': ['LU','Luxembourg','EUR'],
  '446': ['MO','Macao','MOP'],          '450': ['MG','Antananarivo','MGA'],    '454': ['MW','Lilongwe','MWK'],
  '458': ['MY','Kuala Lumpur','MYR'],   '462': ['MV','Malé','MVR'],            '466': ['ML','Bamako','XOF'],
  '470': ['MT','Valletta','EUR'],       '478': ['MR','Nouakchott','MRU'],      '480': ['MU','Port Louis','MUR'],
  '484': ['MX','Mexico City','MXN'],    '496': ['MN','Ulaanbaatar','MNT'],     '498': ['MD','Chișinău','MDL'],
  '499': ['ME','Podgorica','EUR'],      '504': ['MA','Rabat','MAD'],           '508': ['MZ','Maputo','MZN'],
  '512': ['OM','Muscat','OMR'],         '516': ['NA','Windhoek','NAD'],        '524': ['NP','Kathmandu','NPR'],
  '528': ['NL','Amsterdam','EUR'],      '540': ['NC','Nouméa','XPF'],          '548': ['VU','Port Vila','VUV'],
  '554': ['NZ','Wellington','NZD'],     '558': ['NI','Managua','NIO'],         '562': ['NE','Niamey','XOF'],
  '566': ['NG','Abuja','NGN'],          '578': ['NO','Oslo','NOK'],            '580': ['MP','Saipan','USD'],
  '583': ['FM','Palikir','USD'],        '584': ['MH','Majuro','USD'],          '585': ['PW','Ngerulmud','USD'],
  '586': ['PK','Islamabad','PKR'],      '591': ['PA','Panama City','PAB'],     '598': ['PG','Port Moresby','PGK'],
  '600': ['PY','Asunción','PYG'],       '604': ['PE','Lima','PEN'],            '608': ['PH','Manila','PHP'],
  '612': ['PN','Adamstown','NZD'],      '616': ['PL','Warsaw','PLN'],          '620': ['PT','Lisbon','EUR'],
  '624': ['GW','Bissau','XOF'],         '626': ['TL','Dili','USD'],            '630': ['PR','San Juan','USD'],
  '634': ['QA','Doha','QAR'],           '638': ['RE','Saint-Denis','EUR'],     '642': ['RO','Bucharest','RON'],
  '643': ['RU','Moscow','RUB'],         '646': ['RW','Kigali','RWF'],          '659': ['KN','Basseterre','XCD'],
  '662': ['LC','Castries','XCD'],       '670': ['VC','Kingstown','XCD'],       '674': ['SM','San Marino','EUR'],
  '678': ['ST','São Tomé','STN'],       '682': ['SA','Riyadh','SAR'],          '686': ['SN','Dakar','XOF'],
  '688': ['RS','Belgrade','RSD'],       '690': ['SC','Victoria','SCR'],        '694': ['SL','Freetown','SLL'],
  '702': ['SG','Singapore','SGD'],      '703': ['SK','Bratislava','EUR'],      '704': ['VN','Hanoi','VND'],
  '705': ['SI','Ljubljana','EUR'],      '706': ['SO','Mogadishu','SOS'],       '710': ['ZA','Pretoria','ZAR'],
  '716': ['ZW','Harare','ZWL'],         '724': ['ES','Madrid','EUR'],          '728': ['SS','Juba','SSP'],
  '729': ['SD','Khartoum','SDG'],       '732': ['EH','El Aaiún','MAD'],        '740': ['SR','Paramaribo','SRD'],
  '748': ['SZ','Mbabane','SZL'],        '752': ['SE','Stockholm','SEK'],       '756': ['CH','Bern','CHF'],
  '760': ['SY','Damascus','SYP'],       '762': ['TJ','Dushanbe','TJS'],        '764': ['TH','Bangkok','THB'],
  '768': ['TG','Lomé','XOF'],           '776': ['TO','Nukuʻalofa','TOP'],      '780': ['TT','Port of Spain','TTD'],
  '784': ['AE','Abu Dhabi','AED'],      '788': ['TN','Tunis','TND'],           '792': ['TR','Ankara','TRY'],
  '795': ['TM','Ashgabat','TMT'],       '796': ['TC','Cockburn Town','USD'],   '798': ['TV','Funafuti','AUD'],
  '800': ['UG','Kampala','UGX'],        '804': ['UA','Kyiv','UAH'],            '807': ['MK','Skopje','MKD'],
  '818': ['EG','Cairo','EGP'],          '826': ['GB','London','GBP'],          '834': ['TZ','Dodoma','TZS'],
  '840': ['US','Washington, D.C.','USD'],'854':['BF','Ouagadougou','XOF'],     '858': ['UY','Montevideo','UYU'],
  '860': ['UZ','Tashkent','UZS'],       '862': ['VE','Caracas','VES'],         '876': ['WF','Mata-Utu','XPF'],
  '882': ['WS','Apia','WST'],           '887': ['YE','Sana’a','YER'],     '894': ['ZM','Lusaka','ZMW'],
}

// Convert alpha-2 country code to regional-indicator emoji flag.
function alpha2ToFlag(a2) {
  if (!a2 || a2.length !== 2) return ''
  const base = 0x1F1E6
  return String.fromCodePoint(base + (a2.charCodeAt(0) - 65)) + String.fromCodePoint(base + (a2.charCodeAt(1) - 65))
}

export const COUNTRY_INFO = Object.fromEntries(
  Object.entries(RAW).map(([id, [a2, capital, currency]]) => [
    id,
    { alpha2: a2, capital, currency, flag: alpha2ToFlag(a2) },
  ])
)
