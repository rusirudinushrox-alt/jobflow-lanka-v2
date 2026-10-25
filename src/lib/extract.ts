/** Local extraction – NO AI
 * Rule-based priority system so similar (but different) ads still extract correctly.
 *
 * Priority ideas:
 *  1) Never treat headcount (Girl 1k, පිරිමි 04) as money
 *  2) Never treat years (2026) or phone digits as money
 *  3) Payment: total 2800/= > compound sum > labeled Payment: > 4k rate > bare number
 *  4) Time: missing am/pm → if end < start or end ≤6 with morning start → treat end as PM
 *  5) Food: explicit "naa/no" beats keyword "food"
 *  6) Gender counts in SI/EN/Singlish before generic boy/girl
 */

const LOCATIONS: { keys: string[]; name: string; district?: string }[] = [
  { keys: ['රාජගිරිය', 'rajagiriya'], name: 'රාජගිරිය', district: 'Colombo' },
  { keys: ['මාලිගාවත්ත', 'maligawatta', 'maligawatte'], name: 'මාලිගාවත්ත', district: 'Colombo' },
  { keys: ['කොළඹ', 'colombo', 'කොලඹ'], name: 'කොළඹ', district: 'Colombo' },
  { keys: ['viharamahadevi', 'විහාරමහාදේවී', 'vihara mahadevi'], name: 'Viharamahadevi Park', district: 'Colombo' },
  { keys: ['colombo city center', 'city center', 'ccc'], name: 'Colombo City Center', district: 'Colombo' },
  { keys: ['නුගේගොඩ', 'nugegoda'], name: 'නුගේගොඩ', district: 'Colombo' },
  { keys: ['මහරගම', 'maharagama'], name: 'මහරගම', district: 'Colombo' },
  { keys: ['කෝට්ටේ', 'kotte', 'sri jayawardenepura'], name: 'කෝට්ටේ', district: 'Colombo' },
  { keys: ['බත්තරමුල්ල', 'battaramulla'], name: 'බත්තරමුල්ල', district: 'Colombo' },
  { keys: ['දෙහිවල', 'dehiwala'], name: 'දෙහිවල', district: 'Colombo' },
  { keys: ['මොරටුව', 'moratuwa'], name: 'මොරටුව', district: 'Colombo' },
  { keys: ['කඩුවෙල', 'kaduwela'], name: 'කඩුවෙල', district: 'Colombo' },
  { keys: ['හෝමාගම', 'homagama'], name: 'හෝමාගම', district: 'Colombo' },
  { keys: ['මාලබේ', 'malabe'], name: 'මාලබේ', district: 'Colombo' },
  { keys: ['කිරුළපන', 'kirulapone', 'kirulapana', 'kirulopone', 'kirulapone'], name: 'කිරුළපන', district: 'Colombo' },
  { keys: ['බොරැල්ල', 'borella'], name: 'බොරැල්ල', district: 'Colombo' },
  { keys: ['පෙට්ටා', 'pettah'], name: 'පෙට්ටා', district: 'Colombo' },
  { keys: ['අත්තිඩිය', 'aththidiya'], name: 'අත්තිඩිය', district: 'Colombo' },
  { keys: ['මතෙගොඩ', 'mattegoda'], name: 'මතෙගොඩ', district: 'Colombo' },
  { keys: ['පිලියන්දල', 'piliyandala'], name: 'පිලියන්දල', district: 'Colombo' },
  { keys: ['කොස්වත්ත', 'koswatta'], name: 'කොස්වත්ත', district: 'Colombo' },
  { keys: ['තලවතුගොඩ', 'talawatugoda'], name: 'තලවතුගොඩ', district: 'Colombo' },
  { keys: ['රත්මලාන', 'ratmalana'], name: 'රත්මලාන', district: 'Colombo' },
  { keys: ['මාරදාන', 'මරදාන', 'maradana'], name: 'මාරදාන', district: 'Colombo' },
  { keys: ['බම්බලපිටිය', 'bambalapitiya'], name: 'බම්බලපිටිය', district: 'Colombo' },
  { keys: ['කොල්ලුපිටිය', 'kollupitiya'], name: 'කොල්ලුපිටිය', district: 'Colombo' },
  { keys: ['වැල්ලවත්ත', 'wellawatte', 'wellawatta'], name: 'වැල්ලවත්ත', district: 'Colombo' },
  { keys: ['කේ-සෝන්', 'k-zone', 'kzone'], name: 'K-Zone', district: 'Colombo' },
  { keys: ['වත්තල', 'wattala'], name: 'වත්තල', district: 'Gampaha' },
  { keys: ['කැලණිය', 'kelaniya', 'kalaniya'], name: 'කැලණිය', district: 'Gampaha' },
  { keys: ['keells', 'කීල්ස්'], name: 'Keells', district: 'Gampaha' },
  { keys: ['ගම්පහ', 'gampaha'], name: 'ගම්පහ', district: 'Gampaha' },
  { keys: ['නෙගොම්බෝ', 'negombo'], name: 'නෙගොම්බෝ', district: 'Gampaha' },
  { keys: ['රාගම', 'ragama'], name: 'රාගම', district: 'Gampaha' },
  { keys: ['කඩවත', 'kadawatha'], name: 'කඩවත', district: 'Gampaha' },
  { keys: ['ජා-ඇල', 'ja-ela', 'jaela'], name: 'ජා-ඇල', district: 'Gampaha' },
  { keys: ['කිරිබත්ගොඩ', 'kiribathgoda'], name: 'කිරිබත්ගොඩ', district: 'Gampaha' },
  { keys: ['මහනුවර', 'kandy'], name: 'මහනුවර', district: 'Kandy' },
  { keys: ['පේරාදෙණිය', 'peradeniya'], name: 'පේරාදෙණිය', district: 'Kandy' },
  { keys: ['ගම්පොල', 'gampola'], name: 'ගම්පොල', district: 'Kandy' },
  { keys: ['නුවරඑළිය', 'nuwara eliya', 'nuwaraeliya'], name: 'නුවරඑළිය', district: 'Nuwara Eliya' },
  { keys: ['බදුල්ල', 'badulla'], name: 'බදුල්ල', district: 'Badulla' },
  { keys: ['බණ්ඩාරවෙල', 'bandarawela'], name: 'බණ්ඩාරවෙල', district: 'Badulla' },
  { keys: ['ගාල්ල', 'galle'], name: 'ගාල්ල', district: 'Galle' },
  { keys: ['මාතර', 'matara'], name: 'මාතර', district: 'Matara' },
  { keys: ['හම්බන්තොට', 'hambantota'], name: 'හම්බන්තොට', district: 'Hambantota' },
  { keys: ['කුරුණෑගල', 'kurunegala'], name: 'කුරුණෑගල', district: 'Kurunegala' },
  { keys: ['අනුරාධපුර', 'anuradhapura'], name: 'අනුරාධපුර', district: 'Anuradhapura' },
  { keys: ['පොළොන්නරුව', 'polonnaruwa'], name: 'පොළොන්නරුව', district: 'Polonnaruwa' },
  { keys: ['මාතලේ', 'matale'], name: 'මාතලේ', district: 'Matale' },
  { keys: ['රත්නපුර', 'ratnapura'], name: 'රත්නපුර', district: 'Ratnapura' },
  { keys: ['අවිස්සාවේල්ල', 'avissawella', 'awissawella'], name: 'අවිස්සාවේල්ල', district: 'Colombo' },
  { keys: ['කෑගල්ල', 'kegalle'], name: 'කෑගල්ල', district: 'Kegalle' },
  { keys: ['ත්‍රිකුණාමලය', 'trincomalee', 'trico'], name: 'ත්‍රිකුණාමලය', district: 'Trincomalee' },
  { keys: ['මඩකලපුව', 'batticaloa'], name: 'මඩකලපුව', district: 'Batticaloa' },
  { keys: ['යාපනය', 'jaffna'], name: 'යාපනය', district: 'Jaffna' },
]

export type Extracted = {
  location: string
  locations: string[]
  district: string
  time: string
  payment: string
  paymentNum: number
  food: boolean
  date: string
  dates: string[]
  duration: string
  workType: string
  gender: string
  requirement: string
  contact: string
  contactName: string
  employmentType: 'part-time' | 'full-time'
  immediate: boolean
  special: string[]
  clean: string
  title: string
}

function pad(n: number) {
  return n < 10 ? '0' + n : '' + n
}

function isYearLike(n: number) {
  return n >= 2020 && n <= 2035
}

/** SL mobile: 07X XXX XXXX with optional spaces */
const PHONE_RE = /(?:0|\+?94)?7[\d\s\-]{8,14}\d/g

/** Remove person-count phrases so they never become salary */
function stripHeadcount(text: string): string {
  return text
    // headcount: boy 2k, Girl 1k
    .replace(/(?:girls?|boys?|කොල්ල|කෙල්ල|දෙනෙක්|ළමයි|lamai)\s*\d{1,2}\s*[kK]\b/gi, ' ')
    .replace(/\b\d{1,2}\s*[kK]\s*(?:onii|oni|ඕන|denek|දෙනෙක්)/gi, ' ')
    .replace(/(?:පිරිමි|ගැහැණු|ගැහැනු)\s*(?:ළමයි|lamai)?\s*\d{1,2}/gi, ' ')
    // duration hours: peya 9k / පැය 9ක් / hours 9k — NOT money
    .replace(/(?:peya|පැය|hours?|hrs?)\s*\d{1,2}\s*[kK]?\s*(?:weda|wedak|වැඩ)?/gi, ' ')
    .replace(/\d{1,2}\s*[kK]\s*(?:weda|wedak|hours?|පැය)/gi, ' ')
}

function to24(h: number, ap: string): number {
  const a = (ap || '').toLowerCase()
  if (a === 'pm' && h < 12) return h + 12
  if (a === 'am' && h === 12) return 0
  return h
}

/**
 * Common rule: job ads write 8-3.30 or 9-5 meaning morning→afternoon.
 * If end hour is small and start is morning, end is PM.
 */
function inferEndHour(h1: number, h2: number, ap1: string, ap2: string): number {
  if (ap2) return to24(h2, ap2)
  if (h2 <= 6 && h1 >= 7 && h1 <= 11) return h2 + 12
  if (h2 <= 11 && h1 >= 12) return h2 + 12
  if (!ap1 && h1 <= 11 && h2 <= 11 && h2 < h1) return h2 + 12
  if (h1 <= 12 && h2 <= 8 && h2 < h1) return h2 + 12
  return h2
}

export function extractAll(text: string): Extracted {
  const t = text || ''
  const r: Extracted = {
    location: '', locations: [], district: '', time: '', payment: '', paymentNum: 0,
    food: false, date: '', dates: [], duration: '', workType: '', gender: '', requirement: '',
    contact: '', contactName: '', employmentType: 'part-time',
    immediate: false, special: [], clean: '', title: ''
  }

  // ========== PHONE ==========
  const phones = t.match(PHONE_RE) || []
  if (phones.length) {
    let p = phones[0].replace(/[\s\-]/g, '')
    if (p.startsWith('94')) p = '0' + p.slice(2)
    if (!p.startsWith('0') && p.length === 9) p = '0' + p
    // valid SL mobile: 07XXXXXXXX (10 digits)
    if (/^07\d{8}$/.test(p)) r.contact = p
  }

  // ========== LOCATIONS ==========
  // Rule: "X awata idan transport" / "from X transport" = pickup only, NOT job site
  const lowerAll = t.toLowerCase()
  const pickupNames: string[] = []
  const transportOriginRe =
    /([a-zA-Z\u0D80-\u0DFF\s]{2,40}?)\s*(?:awata|අවට)?\s*(?:idan|ඉඳන්|from)?\s*transport\s*(?:denawa|දෙනවා|දෙනව|provided)?/gi
  let tom: RegExpExecArray | null
  const originChunks: string[] = []
  while ((tom = transportOriginRe.exec(t)) !== null) {
    originChunks.push(tom[1] || tom[0])
  }
  // also: "Kelaniya Kiribathgoda awata idan transport"
  const awataIdan = t.match(/([^\n.]{5,60}?)\s+awata\s+idan\s+transport/i)
  if (awataIdan) originChunks.push(awataIdan[1])

  for (const chunk of originChunks) {
    for (const loc of LOCATIONS) {
      for (const k of loc.keys) {
        if (chunk.toLowerCase().includes(k.toLowerCase()) || chunk.includes(k)) {
          if (!pickupNames.includes(loc.name)) pickupNames.push(loc.name)
        }
      }
    }
  }

  // Explicit venue lines often are the real job site
  const venueLine =
    t.match(/(?:colombo\s*city\s*center|city\s*center)/i) ||
    t.match(/location\s*[-:=]?\s*([^\n]+)/i) ||
    t.match(/📍\s*([^\n]+)/)
  let venueName = ''
  if (venueLine) {
    const raw = (venueLine[1] || venueLine[0] || '').trim()
    if (/city\s*center/i.test(raw) || /colombo\s*city\s*center/i.test(venueLine[0])) {
      venueName = 'Colombo City Center'
    } else if (venueLine[1] && !/^location$/i.test(venueLine[1].trim())) {
      // only if not the form label "Location"
      const v = venueLine[1].trim().slice(0, 50)
      if (!/^(full\s*name|id\s*no|contact|experience)$/i.test(v)) venueName = v
    }
  }

  for (const loc of LOCATIONS) {
    for (const k of loc.keys) {
      if (lowerAll.includes(k.toLowerCase()) || t.includes(k)) {
        // skip if this city is only a transport pickup origin
        if (pickupNames.includes(loc.name) && loc.name !== venueName) {
          break
        }
        if (!r.locations.includes(loc.name)) r.locations.push(loc.name)
        if (!r.location) {
          r.location = loc.name
          if (loc.district) r.district = loc.district
        }
        break
      }
    }
  }

  // Prefer explicit venue as primary location
  if (venueName) {
    r.location = venueName
    if (!r.locations.includes(venueName)) r.locations.unshift(venueName)
    r.locations = r.locations.filter(n => !pickupNames.includes(n) || n === venueName)
    // City Center is more specific than plain Colombo
    if (/city\s*center/i.test(venueName)) {
      r.locations = r.locations.filter(n => n !== 'කොළඹ')
    }
    if (/colombo/i.test(venueName)) r.district = 'Colombo'
  }

  if (pickupNames.length) {
    r.special.push('Transport: ' + pickupNames.join(', ') + ' සිට')
  }

  // Clean location labels: "*Name 1" → Name, dedupe synonyms
  r.locations = [...new Set(
    r.locations.map(n => n.replace(/^[*\s]+/, '').replace(/\s+\d+\s*$/, '').trim()).filter(Boolean)
  )]
  if (r.location) {
    r.location = r.location.replace(/^[*\s]+/, '').replace(/\s+\d+\s*$/, '').trim()
  }

  // Synonym map: English / Singlish → canonical Sinhala (or keep one)
  const SYN: Record<string, string> = {
    'moratuwa': 'මොරටුව', 'මොරටුව': 'මොරටුව',
    'colombo': 'කොළඹ', 'කොළඹ': 'කොළඹ', 'කොලඹ': 'කොළඹ',
    'kelaniya': 'කැලණිය', 'kalaniya': 'කැලණිය', 'කැලණිය': 'කැලණිය',
    'nugegoda': 'නුගේගොඩ', 'නුගේගොඩ': 'නුගේගොඩ',
    'rajagiriya': 'රාජගිරිය', 'රාජගිරිය': 'රාජගිරිය',
    'wellawatte': 'වැල්ලවත්ත', 'wellawatta': 'වැල්ලවත්ත', 'වැල්ලවත්ත': 'වැල්ලවත්ත',
    'maradana': 'මාරදාන', 'මාරදාන': 'මාරදාන', 'මරදාන': 'මාරදාන',
  }
  function canonLoc(n: string): string {
    const low = n.toLowerCase().trim()
    // "Moratuwa K-zone" / "Moratuwa K Zone" → මොරටුව K-Zone
    const kzone = /k\s*-?\s*zone/i.test(n)
    for (const [k, v] of Object.entries(SYN)) {
      if (low === k || low.includes(k)) {
        return kzone ? v + ' K-Zone' : v
      }
    }
    if (kzone && /moratuwa|මොරටුව/i.test(n)) return 'මොරටුව K-Zone'
    if (/^k\s*-?\s*zone$/i.test(n)) return 'K-Zone'
    return n
  }
  r.locations = [...new Set(r.locations.map(canonLoc))]
  // If we have "මොරටුව K-Zone", drop bare මොරටුව and bare K-Zone
  if (r.locations.some(n => /K-Zone/i.test(n) && n !== 'K-Zone')) {
    r.locations = r.locations.filter(n => n !== 'K-Zone')
  }
  for (const combined of r.locations.filter(n => /K-Zone/i.test(n))) {
    const base = combined.replace(/\s*K-Zone/i, '').trim()
    r.locations = r.locations.filter(n => n !== base)
  }
  if (r.location) r.location = canonLoc(r.location)
  // Primary = first remaining or combined
  if (r.locations.length) r.location = r.locations[0]


  if (!r.location) {
    const locLine = t.match(/location\s*[-:=]?\s*([^\n,]+)/i)
    if (locLine) {
      const v = locLine[1].trim().slice(0, 40)
      if (!/^(full\s*name|id\s*no|contact|experience)?$/i.test(v)) r.location = v
    }
  }

  // ========== DATE / DURATION ==========
  const md = t.match(/(නොවැම්බර්|ඔක්තෝබර්|දෙසැම්බර්|සැප්තැම්බර්|november|october|december|september|january|february|march|april|june|july|august)\s*[-.]?\s*(\d{1,2})/i)
  if (md) r.date = (md[1] + ' ' + md[2]).replace(/\s+/g, ' ')
  else if (/ada\s*sunday|අද\s*sunday|today\s*sunday/i.test(t)) r.date = 'අද (ඉරිදා)'
  else if (/\bada\b|අද|today/i.test(t)) r.date = 'අද'
  else if (/හෙට|heta|tomorrow/i.test(t)) r.date = 'හෙට'
  else if (/monday|සඳුදා/i.test(t)) r.date = 'සඳුදා'
  else if (/tuesday|අඟහරුවාදා/i.test(t)) r.date = 'අඟහරුවාදා'
  else if (/wednesday|බදාදා/i.test(t)) r.date = 'බදාදා'
  else if (/thursday|බ්‍රහස්පතින්දා|බ්රහස්/i.test(t)) r.date = 'බ්‍රහස්පතින්දා'
  else if (/friday|සිකුරාදා/i.test(t)) r.date = 'සිකුරාදා'
  else if (/saturday|සෙනසුරාදා/i.test(t)) r.date = 'සෙනසුරාදා'
  else if (/sunday|ඉරිදා/i.test(t)) r.date = 'ඉරිදා'
  else {
    const dayOnly = t.match(/\bdate\s*[-:=]?\s*(\d{1,2})\b/i)
    if (dayOnly) {
      const d = parseInt(dayOnly[1], 10)
      if (d >= 1 && d <= 31) r.date = 'Date ' + d
    }
  }

  // ISO-like dates collect
  // 2026.10.25 or 2026 .10.25 or 2026/10/25 — strip spaces around dots
  const isoDates = t.replace(/(\d{4})\s*[.\/\-]\s*(\d{1,2})\s*[.\/\-]\s*(\d{1,2})/g, '$1.$2.$3')
    .match(/\b20\d{2}[./\-]\d{1,2}[./\-]\d{1,2}\b/g)
  if (isoDates) {
    r.dates = [...new Set(isoDates)]
    // Prefer full date over bare හෙට when both present
    const main = isoDates[0]
    const heta = /හෙට|heta|tomorrow/i.test(t) ? ' (හෙට)' : ''
    r.date = main + heta
  }

  // Duration: "දින 7ක්" / "3 days" beats hour math
  const daysM = t.match(/දින\s*(\d{1,2})\s*ක්/i) || t.match(/(\d{1,2})\s*(?:days?|dawas|dawasak)\b/i)
  const hoursM = t.match(/(?:peya|පැය|hours?|hrs?)\s*(\d{1,2})\s*[kK]?/i) ||
                 t.match(/(\d{1,2})\s*[kK]?\s*(?:peya|පැය|hours?|hrs?)/i) ||
                 t.match(/(\d{1,2})\s*(?:hours?|hrs?|පැය)\b/i)
  if (daysM) r.duration = 'දින ' + daysM[1]
  else if (hoursM) r.duration = 'පැය ' + (hoursM[1] || hoursM[2])
  else if (/full\s*day|පූර්ණ\s*දින/i.test(t)) r.duration = 'Full day'

  // ========== TIME (common PM inference) ==========
  // Never treat calendar dates (2026.10.25 / 10.25 from year-date) as clock time
  let timeSrc = t
    .replace(/\b20\d{2}\s*[./\-]\s*\d{1,2}\s*[./\-]\s*\d{1,2}\b/g, ' ')
    .replace(/\b20\d{2}\b/g, ' ')
  // If morning (ude) is stated, ignore conflicting "7pm/4pm" style pairs later in ad
  if (/(?:ude|උදේ|morning)/i.test(t)) {
    timeSrc = timeSrc.replace(/\b\d{1,2}\s*pm\s*[\/\-]\s*\d{1,2}\s*pm\b/gi, ' ')
  }
  // Normalize "9 00,am ,6 00 pm" / "9.00am,6.00pm" → easier match
  timeSrc = timeSrc
    .replace(/(\d{1,2})\s+00\s*,?\s*(am|pm)/gi, '$1:00 $2')
    .replace(/(\d{1,2})\s*[.:]\s*(\d{2})\s*,?\s*(am|pm)/gi, '$1:$2 $3')
    .replace(/time\s*[-:=]?\s*/i, 'Time ')

  const timeRange = timeSrc.match(/(\d{1,2})(?:[.:](\d{2}))?\s*(am|pm|AM|PM)?\s*[-–to]+\s*(\d{1,2})(?:[.:](\d{2}))?\s*(am|pm|AM|PM)?/i)
  const timeLabel = /time\s*[-:=]?\s*(\d{1,2})\s*[\/\-–]\s*(\d{1,2})/i.exec(timeSrc)
  const singleTime = timeSrc.match(/(\d{1,2})[.:](\d{2})\s*(am|pm|AM|PM)?/i)
  if (timeRange) {
    let h1 = parseInt(timeRange[1], 10)
    const m1 = timeRange[2] || '00'
    const ap1 = timeRange[3] || ''
    let h2 = parseInt(timeRange[4], 10)
    const m2 = timeRange[5] || '00'
    const ap2 = timeRange[6] || ''
    h1 = to24(h1, ap1)
    h2 = inferEndHour(h1, h2, ap1, ap2)
    r.time = pad(h1) + ':' + m1 + ' - ' + pad(h2) + ':' + m2
  } else {
    const ampmPair = timeSrc.match(/(\d{1,2})(?::(\d{2}))?\s*(am)\s*[,.\\-–to]*\s*(\d{1,2})(?::(\d{2}))?\s*(pm)/i)
    if (ampmPair) {
      const h1 = to24(parseInt(ampmPair[1], 10), 'am')
      const h2 = to24(parseInt(ampmPair[4], 10), 'pm')
      r.time = pad(h1) + ':' + (ampmPair[2] || '00') + ' - ' + pad(h2) + ':' + (ampmPair[5] || '00')
    }
  }
  if (!r.time && timeLabel) {
    let a = parseInt(timeLabel[1], 10)
    let b = parseInt(timeLabel[2], 10)
    b = inferEndHour(a, b, '', '')
    r.time = pad(a) + ':00 - ' + pad(b) + ':00'
  }
  if (!r.time && singleTime) {
    let h = parseInt(singleTime[1], 10)
    const m = singleTime[2]
    h = to24(h, singleTime[3] || '')
    r.time = pad(h) + ':' + m
  }

  // ude/උදේ = morning AM | hawasa/හවස = evening PM  (never swap)
  if (!r.time) {
    const ude = t.match(/(?:ude|උදේ|uday|morning)\s*(\d{1,2})\s*(?::(\d{2}))?\s*(?:ta|ට|ටට)?/i) ||
                t.match(/(\d{1,2})\s*(?::(\d{2}))?\s*(?:ta|ට)?\s*(?:ude|උදේ|morning)/i)
    const haw = t.match(/(?:hawasa|හවස|havas|evening|rathri|රාත්‍රී)\s*(\d{1,2})\s*(?::(\d{2}))?\s*(?:ta|ට)?/i) ||
                t.match(/(\d{1,2})\s*(?::(\d{2}))?\s*(?:ta|ට)?\s*(?:hawasa|හවස|evening)/i)
    if (ude) {
      let h = parseInt(ude[1], 10)
      if (h === 12) h = 0
      // morning: keep 1-11 as AM, 12 = 00
      if (h >= 1 && h <= 11) { /* AM ok */ }
      else if (h === 12) h = 0
      r.time = pad(h) + ':' + (ude[2] || '00') + ' පටන් (උදේ)'
    } else if (haw) {
      let h = parseInt(haw[1], 10)
      if (h < 12) h += 12
      r.time = pad(h) + ':' + (haw[2] || '00') + ' පටන් (හවස)'
    }
  }
  if (!r.time) {
    const fromT = timeSrc.match(/(?:from|පටන්|patan|start)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*(?:පටන්|patan|onwards|from)?/i) ||
                  timeSrc.match(/(\d{1,2})(?::(\d{2}))?\s*(pm|am)\s*(?:පටන්|patan)/i)
    if (fromT) {
      const h = to24(parseInt(fromT[1], 10), fromT[3] || '')
      r.time = pad(h) + ':' + (fromT[2] || '00') + ' පටන්'
    }
  }
  // If text has ude + also a stray 7pm/4pm, prefer ude (already set) — do not override



  // Reject impossible times (e.g. 26:10 from mangled dates)
  if (r.time) {
    const bad = r.time.split(/\s*-\s*|\s+/).some(part => {
      const hm = part.match(/(\d{1,2}):(\d{2})/)
      if (!hm) return false
      const h = parseInt(hm[1], 10), m = parseInt(hm[2], 10)
      return h > 23 || m > 59
    })
    if (bad) r.time = ''
  }
  // If no real clock pattern was in original text (only dates), clear time
  if (r.time) {
    const hasClock = /\b\d{1,2}\s*[:.]\s*\d{2}\s*(am|pm)?\b|\b\d{1,2}\s*(am|pm)\b|time\s*[-:=]?\s*\d/i.test(
      t.replace(/\b20\d{2}\s*[./\-]\s*\d{1,2}\s*[./\-]\s*\d{1,2}\b/g, ' ')
    )
    if (!hasClock && !/\d{1,2}\s*[\/\-–]\s*\d{1,2}/.test(t.replace(/20\d{2}/g, ''))) {
      // allow only if am/pm or explicit Time label existed
      if (!/\b(?:am|pm)\b|\btime\b/i.test(t)) r.time = ''
    }
  }

  if (!r.duration && r.time.includes(' - ')) {
    const [a, b] = r.time.split(' - ')
    const h1 = parseInt(a, 10), h2 = parseInt(b, 10)
    if (!isNaN(h1) && !isNaN(h2)) {
      let diff = h2 - h1
      if (diff < 0) diff += 24
      if (diff > 0 && diff <= 16) r.duration = 'පැය ' + diff
    }
  }

  // ========== PAYMENT (priority ladder) ==========
  let payText = t.replace(PHONE_RE, ' ')
  payText = payText.replace(/\b20\d{2}[\/\-.]\d{1,2}[\/\-.]\d{1,2}\b/g, ' ')
  payText = payText.replace(/\b20\d{2}\b/g, ' ')
  payText = stripHeadcount(payText)
  // Target/goal lines are not base salary
  payText = payText.replace(/target\s*[^\n]*/gi, ' ')

  let paymentFound = false

  // 0) Hours-rate line: "පැය 9 = 2800" / "peya 9 = 2800"
  {
    const hrPay = t.match(/(?:peya|පැය)\s*\d{1,2}\s*[kK]?\s*[=:]\s*(?:rs\.?)?\s*([0-9]{3,6})/i)
    if (hrPay) {
      const num = parseInt(hrPay[1], 10)
      if (num >= 500 && num <= 100000 && !isYearLike(num)) {
        r.paymentNum = num
        r.payment = 'Rs. ' + num.toLocaleString('en-LK')
        paymentFound = true
      }
    }
  }

  // 0b) Sinhala rate cards: පැය 12  2,000/= | දිනකට 4,000/= | සතියකට | මාසකට
  // Prefer දිනකට (day) as main board rate, else පැය rate; ignore monthly as sole "daily" pay
  if (!paymentFound) {
    const dayRate = t.match(/දිනකට\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]{3,6})\s*\/\s*=?/i)
    const hourRate = t.match(/පැය\s*\d{1,2}\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]{3,6})\s*\/\s*=?/i)
    const pick = dayRate || hourRate
    if (pick) {
      const num = parseInt(pick[1].replace(/,/g, ''), 10)
      if (num >= 500 && num <= 50000 && !isYearLike(num)) {
        r.paymentNum = num
        r.payment = 'Rs. ' + num.toLocaleString('en-LK')
        if (dayRate) r.payment += ' (දිනකට)'
        else if (hourRate) r.payment += ' (පැය)'
        paymentFound = true
      }
    }
  }
  // 0c) Any amount with comma: 2,000/=
  if (!paymentFound) {
    const m = payText.match(/\b([1-9][0-9]{0,2},[0-9]{3})\s*\/\s*=?/)
    if (m) {
      const num = parseInt(m[1].replace(/,/g, ''), 10)
      if (num >= 500 && num <= 50000 && !isYearLike(num)) {
        r.paymentNum = num
        r.payment = 'Rs. ' + num.toLocaleString('en-LK')
        paymentFound = true
      }
    }
  }

  // 1) Compound FIRST: Payment 2000+500(food)+300(transport) → breakdown
  if (!paymentFound) {
    const m = t.match(
      /(?:payment|peymnt|peya|pay|ගෙවීම|salary)\s*[-:=]?\s*([0-9]{3,6})\s*\+\s*([0-9]{2,5})(\s*\([^)]*\))?(?:\s*\+\s*([0-9]{2,5})(\s*\([^)]*\))?)?/i
    )
    if (m) {
      const a = parseInt(m[1], 10)
      const b = parseInt(m[2], 10)
      const bNote = (m[3] || '').replace(/[()]/g, '').trim()
      const c = m[4] ? parseInt(m[4], 10) : 0
      const cNote = (m[5] || '').replace(/[()]/g, '').trim()
      const sum = a + b + c
      if (sum >= 500 && sum <= 100000) {
        r.paymentNum = sum
        const parts = [a.toLocaleString('en-LK')]
        parts.push(b.toLocaleString('en-LK') + (bNote ? '(' + bNote + ')' : ''))
        if (c) parts.push(c.toLocaleString('en-LK') + (cNote ? '(' + cNote + ')' : ''))
        const tot = t.match(/\b([1-9][0-9]{3,5})\s*\/\s*=?/)
        const totNum = tot ? parseInt(tot[1], 10) : sum
        r.payment = 'Rs. ' + parts.join('+') + ' = ' + totNum.toLocaleString('en-LK')
        if (/food|කෑම/i.test(bNote + ' ' + cNote)) r.food = true
        paymentFound = true
      }
    }
  }

  // 2) Explicit total only if no compound: 2800/=
  if (!paymentFound) {
    const m = payText.match(/\b([1-9][0-9]{3,5})\s*\/\s*=?/)
    if (m) {
      const num = parseInt(m[1], 10)
      if (num >= 500 && num <= 100000 && !isYearLike(num)) {
        r.paymentNum = num
        r.payment = 'Rs. ' + num.toLocaleString('en-LK')
        paymentFound = true
      }
    }
  }

  // 3) Labeled: Payment:3000 / peymnt 2500
  if (!paymentFound) {
    const m = payText.match(
      /(?:payment|peymnt|peya|paymnt|ගෙවීම|salary|rate|pay)\s*[-:=*]?\s*(?:rs\.?|රු\.?)?\s*([0-9]{3,6})/i
    )
    if (m) {
      const num = parseInt(m[1], 10)
      if (num >= 500 && num <= 100000 && !isYearLike(num)) {
        r.paymentNum = num
        r.payment = 'Rs. ' + num.toLocaleString('en-LK')
        paymentFound = true
      }
    }
  }

  // 4) Rate style 4k / 2.5k (not 1k headcount — already stripped; min 2k)
  if (!paymentFound) {
    const m = payText.match(/\b([2-9](?:\.\d)?|[1-9]\d(?:\.\d)?)\s*[kK]\b/)
    if (m) {
      const num = Math.round(parseFloat(m[1]) * 1000)
      if (num >= 2000 && num <= 100000) {
        r.paymentNum = num
        r.payment = 'Rs. ' + num.toLocaleString('en-LK')
        paymentFound = true
      }
    }
  }

  // 5) Rs. 2500 or 2500+food
  if (!paymentFound) {
    const patterns = [
      /(?:rs\.?|රු\.?)\s*([0-9]{3,6})/i,
      /([0-9]{3,6})\s*(?:\+|plus)\s*(?:food|කෑම)/i,
      /([0-9]{3,6})\s*\/\s*-/,
    ]
    for (const re of patterns) {
      const m = payText.match(re)
      if (m) {
        const num = parseInt(m[1], 10)
        if (num >= 500 && num <= 100000 && !isYearLike(num)) {
          r.paymentNum = num
          r.payment = 'Rs. ' + num.toLocaleString('en-LK')
          paymentFound = true
          break
        }
      }
    }
  }

  // 6) Bare 4-digit daily rate (pick largest sensible)
  if (!paymentFound) {
    const bare = payText.match(/\b([1-9][0-9]{3,4})\b/g)
    if (bare) {
      const nums = bare.map(b => parseInt(b, 10)).filter(n => n >= 1500 && n <= 15000 && !isYearLike(n))
      if (nums.length) {
        r.paymentNum = Math.max(...nums)
        r.payment = 'Rs. ' + r.paymentNum.toLocaleString('en-LK')
        paymentFound = true
      }
    }
  }

  // ========== FOOD (no beats yes) ==========
  if (/food\s*denne\s*naa|food\s*naa|no\s*food|කෑම\s*නැ|without\s*food|food\s*netha|කෑම\s*අැ/i.test(t)) {
    r.food = false
    r.special.push('කෑම නැහැ')
  } else if (/food|කෑම|lunch|කැම|\+food|ආහාර\s*සමග|ආහාර\s*එක්ක/i.test(t)) {
    r.food = true
  }

  if (/trnsport|transport|ගමන්|traveling/i.test(t) && r.payment && !/transport|trnsport/i.test(r.payment)) {
    r.payment += ' + transport'
  }

  // ========== SPECIAL ==========
  {
    const withoutForm = t
      .replace(/(?:නම|දුරකතන|හැඳුනුම්පත්|නගරය|full\s*name|id\s*no|contact)[\s\S]*$/i, '')
      .replace(/\bid\s*(no|number)\b/gi, ' ')
      .replace(/ජාතිකත්වය/gi, ' ')
    if (/(?:id\s*card|nic|හැඳුනුම්\s*පත\s*ගෙන|id\s*ගෙන|bring\s*id)/i.test(withoutForm)) {
      r.special.push('ID ගෙනෙන්න')
    } else if (/\bid\b/i.test(withoutForm) && /(?:ගෙනෙන්න|ගෙන|gena|ඕනේ|onii|required)/i.test(withoutForm)) {
      r.special.push('ID ගෙනෙන්න')
    }
  }
  if (/uniform|dress\s*code|white\s*shirt|ඇඳුම|blouse|trouser|shoe/i.test(t)) r.special.push('Dress / Uniform')
  if (/night\s*shift|රාත්‍රී|night\s*wed/i.test(t)) r.special.push('Night shift')
  if (/ot\s*karanna|overtime|\bot\b/i.test(t)) r.special.push('OT available')
  if (/yalu|යාළු|friends?\s*ok|යාළුවෝ/i.test(t)) r.special.push('යාළුවෝ OK')
  if (/ewalema|එන\s*වෙලාවට|on\s*arrival|ගෙවනවා/i.test(t)) r.special.push('එන වෙලාවටම ගෙවනවා')
  {
    const body = t.replace(/(?:full\s*photo|full\s*name|id\s*no|contact\s*number|experience|location)\s*$/gim, '')
      .split(/full\s*photo|full\s*name/i)[0]
    if (/experience|අත්දැකීම/i.test(body) && !/no\s*experience/i.test(body)
      && !/experience\s*$/im.test(t)) {
      // real requirement sentence, not form label alone
      if (/experience\s*(?:ඕන|onii|required|තියෙන්|ගෙන)/i.test(body) || /අත්දැකීම/.test(body))
        r.special.push('Experience ඕනේ')
    }
  }

  // ========== WORK TYPE ==========
  if (/leaflet|leaflets|බෙදන්න/i.test(t)) r.workType = 'Leaflets'
  else if (/boys?\s*vacancy|girls?\s*vacancy|\bvacancy\b/i.test(t)) r.workType = 'Vacancy'
  else if (/\bhelper\b|wedak/i.test(t)) r.workType = 'Helper'
  else if (/promotion|promo|ප්‍රොමෝ|ප්‍රෝමෝ|app\s*promotion/i.test(t)) r.workType = 'Promotion'
  else if (/sales|විකුණුම්|stores?|super|grocery/i.test(t)) r.workType = 'Sales / Store'
  else if (/delivery|ඩෙලිවරි/i.test(t)) r.workType = 'Delivery'
  else if (/ආරක්ෂක|security|guard|සුරක්ෂිත/i.test(t)) r.workType = 'Security'
  else if (/cleaning|පිරිසිදු/i.test(t)) r.workType = 'Cleaning'
  else if (/driver|ධාවක/i.test(t)) r.workType = 'Driver'
  else if (/cashier|කැෂියර්/i.test(t)) r.workType = 'Cashier'
  else r.workType = 'General'

  // ========== GENDER + HEADCOUNT (SI / EN / Singlish) ==========
  const boysN =
    t.match(/(?:පිරිමි|boys?|කොල්ල)\s*(?:ළමයි|lamai|denek|දෙනෙක්)?\s*(\d{1,2})/i) ||
    t.match(/(\d{1,2})\s*(?:පිරිමි|boys?|කොල්ල)/i)
  const girlsN =
    t.match(/(?:ගැහැණු|ගැහැනු|girls?|කෙල්ල)\s*(?:ළමයි|lamai|denek|දෙනෙක්)?\s*(\d{1,2})/i) ||
    t.match(/(\d{1,2})\s*(?:ගැහැණු|girls?|කෙල්ල)/i)
  const headK =
    t.match(/(?:girls?|boys?|කොල්ල|කෙල්ල)\s*(\d{1,2})\s*[kK]\b/i) ||
    t.match(/\b(\d{1,2})\s*[kK]\s*(?:onii|oni|ඕන)/i)

  // "girl or boy 3" / "boy or girl 2k" common pattern first
  const eitherN = t.match(/(?:girl\s*or\s*boy|boy\s*or\s*girl)\s*(\d{1,2})/i)
  if (eitherN) {
    r.gender = 'Boys / Girls'
    r.requirement = eitherN[1] + ' දෙනෙක්'
  } else if (boysN && girlsN) {
    r.gender = 'Boys / Girls'
    r.requirement = 'පිරිමි ' + boysN[1] + ' · ගැහැණු ' + girlsN[1]
  } else if (boysN) {
    r.gender = 'Boys'
    r.requirement = boysN[1] + ' දෙනෙක්'
  } else if (girlsN) {
    r.gender = 'Girls'
    r.requirement = girlsN[1] + ' දෙනෙක්'
  } else if (headK) {
    r.requirement = headK[1] + ' දෙනෙක්'
    if (/girl|කෙල්ල|ගැහැණු/i.test(t)) r.gender = 'Girls'
    else if (/boy|කොල්ල|පිරිමි/i.test(t)) r.gender = 'Boys'
  } else {
    if (/girl\s*or\s*boy|boy\s*or\s*girl|පිරිමි.*ගැහැණු|ගැහැණු.*පිරිමි/i.test(t)) r.gender = 'Boys / Girls'
    else {
      if (/boy|කොල්ල|පිරිමි|male/i.test(t)) r.gender = 'Boys'
      if (/girl|කෙල්ල|ගැහැණු|female/i.test(t)) r.gender = r.gender ? 'Boys / Girls' : 'Girls'
    }
    if (/\bone\b/i.test(t) && !r.requirement) r.requirement = '1 දෙනෙක්'
  }

  if (/full\s*time|පූර්ණ/i.test(t)) r.employmentType = 'full-time'
  if (/urgent|dan\s*enna|දැන්|dn\s*yana|immediate|asap|වහාම/i.test(t)) r.immediate = true

  r.title = [r.workType, r.locations[0] || r.location, r.payment].filter(Boolean).join(' • ') || 'Job'

  // ========== CLEAN PREVIEW ==========
  const lines: string[] = []
  if (r.immediate) lines.push('⚡ Urgent')
  if (r.date) lines.push('📅 ' + r.date)
  if (r.time) lines.push('🕘 ' + r.time)
  if (r.duration) lines.push('⏱️ ' + r.duration)
  if (r.locations.length) lines.push('📍 ' + r.locations.join(' · '))
  else if (r.location) lines.push('📍 ' + r.location)
  if (r.workType) lines.push('🛠️ ' + r.workType)
  if (r.gender || r.requirement) lines.push('👥 ' + [r.gender, r.requirement].filter(Boolean).join(' · '))
  if (r.payment) lines.push('💰 ' + r.payment + (r.food ? ' + කෑම' : ''))
  for (const s of [...new Set(r.special)]) lines.push('✅ ' + s)
  if (r.contact) lines.push('📞 ' + r.contact + (r.contactName ? ' – ' + r.contactName : ''))
  r.clean = lines.join('\n')

  return r
}
