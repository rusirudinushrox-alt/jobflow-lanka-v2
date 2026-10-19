/** Local extraction – NO AI API
 * Fixes: payment vs year, multi-location (SI/EN/Singlish),
 * work-date vs payment-day, time 10/6, special points, duration
 */

const LOCATIONS: { keys: string[]; name: string; district?: string }[] = [
  // Colombo
  { keys: ['රාජගිරිය', 'rajagiriya'], name: 'රාජගිරිය', district: 'Colombo' },
  { keys: ['කොළඹ', 'colombo', 'කොලඹ'], name: 'කොළඹ', district: 'Colombo' },
  { keys: ['නුගේගොඩ', 'nugegoda'], name: 'නුගේගොඩ', district: 'Colombo' },
  { keys: ['මහරගම', 'maharagama'], name: 'මහරගම', district: 'Colombo' },
  { keys: ['කෝට්ටේ', 'kotte', 'sri jayawardenepura'], name: 'කෝට්ටේ', district: 'Colombo' },
  { keys: ['බත්තරමුල්ල', 'battaramulla'], name: 'බත්තරමුල්ල', district: 'Colombo' },
  { keys: ['දෙහිවල', 'dehiwala'], name: 'දෙහිවල', district: 'Colombo' },
  { keys: ['මොරටුව', 'moratuwa'], name: 'මොරටුව', district: 'Colombo' },
  { keys: ['කඩුවෙල', 'kaduwela'], name: 'කඩුවෙල', district: 'Colombo' },
  { keys: ['හෝමාගම', 'homagama'], name: 'හෝමාගම', district: 'Colombo' },
  { keys: ['මාලබේ', 'malabe'], name: 'මාලබේ', district: 'Colombo' },
  { keys: ['කිරුළපන', 'kirulapone', 'kirulapana'], name: 'කිරුළපන', district: 'Colombo' },
  { keys: ['බොරැල්ල', 'borella'], name: 'බොරැල්ල', district: 'Colombo' },
  { keys: ['පෙට්ටා', 'pettah'], name: 'පෙට්ටා', district: 'Colombo' },
  { keys: ['අත්තිඩිය', 'aththidiya'], name: 'අත්තිඩිය', district: 'Colombo' },
  { keys: ['මතෙගොඩ', 'mattegoda'], name: 'මතෙගොඩ', district: 'Colombo' },
  { keys: ['පිලියන්දල', 'piliyandala'], name: 'පිලියන්දල', district: 'Colombo' },
  { keys: ['කොස්වත්ත', 'koswatta'], name: 'කොස්වත්ත', district: 'Colombo' },
  { keys: ['තලවතුගොඩ', 'talawatugoda'], name: 'තලවතුගොඩ', district: 'Colombo' },
  { keys: ['රත්මලාන', 'ratmalana'], name: 'රත්මලාන', district: 'Colombo' },
  { keys: ['මාරදාන', 'maradana'], name: 'මාරදාන', district: 'Colombo' },
  { keys: ['බම්බලපිටිය', 'bambalapitiya'], name: 'බම්බලපිටිය', district: 'Colombo' },
  { keys: ['කොල්ලුපිටිය', 'kollupitiya'], name: 'කොල්ලුපිටිය', district: 'Colombo' },
  { keys: ['වැල්ලවත්ත', 'wellawatte', 'wellawatta'], name: 'වැල්ලවත්ත', district: 'Colombo' },
  // Gampaha
  { keys: ['වත්තල', 'wattala'], name: 'වත්තල', district: 'Gampaha' },
  { keys: ['කැලණිය', 'kelaniya'], name: 'කැලණිය', district: 'Gampaha' },
  { keys: ['ගම්පහ', 'gampaha'], name: 'ගම්පහ', district: 'Gampaha' },
  { keys: ['නෙගොම්බෝ', 'negombo'], name: 'නෙගොම්බෝ', district: 'Gampaha' },
  { keys: ['ජා-ඇල', 'ja-ela', 'jaela'], name: 'ජා-ඇල', district: 'Gampaha' },
  { keys: ['කඳාන', 'kandana'], name: 'කඳාන', district: 'Gampaha' },
  { keys: ['රාගම', 'ragama'], name: 'රාගම', district: 'Gampaha' },
  { keys: ['කිරිබත්ගොඩ', 'kiribathgoda'], name: 'කිරිබත්ගොඩ', district: 'Gampaha' },
  { keys: ['මිනුවන්ගොඩ', 'minuwangoda'], name: 'මිනුවන්ගොඩ', district: 'Gampaha' },
  // Kandy / hill
  { keys: ['මහනුවර', 'kandy'], name: 'මහනුවර', district: 'Kandy' },
  { keys: ['නවලපිටිය', 'nawalapitiya'], name: 'නවලපිටිය', district: 'Kandy' },
  { keys: ['ගම්පොළ', 'gampola'], name: 'ගම්පොළ', district: 'Kandy' },
  { keys: ['පේරාදෙණිය', 'peradeniya'], name: 'පේරාදෙණිය', district: 'Kandy' },
  { keys: ['බොගවන්තලාව', 'bogawanthalawa', 'bogawantalawa'], name: 'Bogawanthalawa', district: 'Nuwara Eliya' },
  { keys: ['norwood'], name: 'Norwood', district: 'Nuwara Eliya' },
  { keys: ['hallaborke', 'halabokka', 'hallabokka'], name: 'Hallaborke', district: 'Nuwara Eliya' },
  { keys: ['නුවරඑළිය', 'nuwara eliya', 'nuwaraeliya'], name: 'නුවරඑළිය', district: 'Nuwara Eliya' },
  { keys: ['හැටන්', 'hatton'], name: 'හැටන්', district: 'Nuwara Eliya' },
  { keys: ['බණ්ඩාරවෙල', 'bandarawela'], name: 'බණ්ඩාරවෙල', district: 'Badulla' },
  { keys: ['බදුල්ල', 'badulla'], name: 'බදුල්ල', district: 'Badulla' },
  // South / other
  { keys: ['ගාල්ල', 'galle'], name: 'ගාල්ල', district: 'Galle' },
  { keys: ['මාතර', 'matara'], name: 'මාතර', district: 'Matara' },
  { keys: ['හම්බන්තොට', 'hambantota'], name: 'හම්බන්තොට', district: 'Hambantota' },
  { keys: ['කුරුණෑගල', 'kurunegala'], name: 'කුරුණෑගල', district: 'Kurunegala' },
  { keys: ['අනුරාධපුර', 'anuradhapura'], name: 'අනුරාධපුර', district: 'Anuradhapura' },
  { keys: ['පොළොන්නරුව', 'polonnaruwa'], name: 'පොළොන්නරුව', district: 'Polonnaruwa' },
  { keys: ['මාතලේ', 'matale'], name: 'මාතලේ', district: 'Matale' },
  { keys: ['රත්නපුර', 'ratnapura'], name: 'රත්නපුර', district: 'Ratnapura' },
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

function isPaymentDayContext(text: string, index: number) {
  const window = text.slice(Math.max(0, index - 45), index + 45).toLowerCase()
  return /pay\s*day|payment\s*day|ගෙවන\s*දවස|ගෙවීම්\s*දින|salary\s*day|peya\s*dena|ගෙවනවා|will\s*pay|pay\s*on|payment\s*on/i.test(window)
}

export function extractAll(text: string): Extracted {
  const t = text || ''
  const lower = t.toLowerCase()
  const r: Extracted = {
    location: '', locations: [], district: '', time: '', payment: '', paymentNum: 0,
    food: false, date: '', dates: [], duration: '', workType: '', gender: '', requirement: '',
    contact: '', contactName: '', employmentType: 'part-time',
    immediate: false, special: [], clean: '', title: ''
  }

  // ---- Phone ----
  const phoneRe = /(?:0|94|\+94)?[\s\-]?7[0-9]{2}[\s\-]?[0-9]{3}[\s\-]?[0-9]{3,4}/g
  const phones = t.match(phoneRe) || []
  if (phones.length) {
    let p = phones[0].replace(/[\s\-]/g, '')
    if (p.startsWith('94')) p = '0' + p.slice(2)
    if (p.length === 9) p = '0' + p
    r.contact = p
  }
  const nameNear = t.match(/(\d{9,11})\s*[💫⭐🌟•\-\s]*([A-Za-z debච-ෆ]{2,18})/i)
  if (nameNear) r.contactName = nameNear[2].trim()

  // ---- Locations: list match + lines after dates ----
  const foundLocs: string[] = []
  let firstDistrict = ''
  for (const loc of LOCATIONS) {
    for (const k of loc.keys) {
      if (lower.includes(k.toLowerCase()) || t.includes(k)) {
        if (!foundLocs.includes(loc.name)) {
          foundLocs.push(loc.name)
          if (!firstDistrict && loc.district) firstDistrict = loc.district
        }
        break
      }
    }
  }
  // Free-text places on lines after YYYY/MM/DD =
  const lineRe = /20\d{2}[\/\-.]\d{1,2}[\/\-.]\d{1,2}\s*[=:\-]?\s*([^\n]{3,80})/g
  let lm: RegExpExecArray | null
  while ((lm = lineRe.exec(t)) !== null) {
    const chunk = lm[1].replace(/[🚫⭐💫•]+/g, ' ').trim()
    // last word-ish tokens that look like place names (Latin capital or Sinhala)
    const tokens = chunk.split(/[\s,|]+/).filter(Boolean)
    for (const tok of tokens) {
      const clean = tok.replace(/[^A-Za-z debච-ෆ.\-]/g, '')
      if (clean.length < 3) continue
      const known = LOCATIONS.find(l =>
        l.keys.some(k => clean.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(clean.toLowerCase()))
      )
      if (known && !foundLocs.includes(known.name)) {
        foundLocs.push(known.name)
        if (!firstDistrict && known.district) firstDistrict = known.district
      } else if (/^[A-Z][a-z]{3,}$/.test(clean) && !foundLocs.includes(clean)) {
        if (!/^(bus|stand|carpark|store|stores|super|grocery|town|the|and|for|with|from|time|date|location|girl|boy|one|urgent|lanka|sarawans|kasmeera)$/i.test(clean)) {
          // only keep if looks like multi-syllable place (optional) – skip brand names
        }
      }
    }
  }
  r.locations = foundLocs
  r.location = foundLocs.join(', ')
  r.district = firstDistrict

  // ---- Dates (skip payment-day context; prefer near locations) ----
  const dateRe = /\b(20\d{2})[\/\-.](\d{1,2})[\/\-.](\d{1,2})\b/g
  const workDates: string[] = []
  let dm: RegExpExecArray | null
  while ((dm = dateRe.exec(t)) !== null) {
    if (isPaymentDayContext(t, dm.index)) continue
    workDates.push(dm[0])
  }
  if (workDates.length === 0) {
    const all = t.match(/\b(20\d{2})[\/\-.](\d{1,2})[\/\-.](\d{1,2})\b/g) || []
    workDates.push(...all)
  }
  const locNearDates: string[] = []
  for (const d of workDates) {
    const idx = t.indexOf(d)
    const near = t.slice(idx, idx + 140).toLowerCase()
    if (LOCATIONS.some(loc => loc.keys.some(k => near.includes(k.toLowerCase())))) {
      locNearDates.push(d)
    }
  }
  const finalDates = locNearDates.length > 0 ? locNearDates : workDates
  if (finalDates.length) {
    r.dates = finalDates
    r.date = finalDates.join(' · ')
  } else {
    if (/හෙට|heta|tomorrow/i.test(t)) r.date = 'හෙට'
    else if (/අද|ada|today/i.test(t)) r.date = 'අද'
    else if (/monday|සඳුදා/i.test(t)) r.date = 'සඳුදා'
    else if (/tuesday|අඟහරුවාදා/i.test(t)) r.date = 'අඟහරුවාදා'
    else if (/wednesday|බදාදා/i.test(t)) r.date = 'බදාදා'
    else if (/thursday|බ්‍රහස්පතින්දා/i.test(t)) r.date = 'බ්‍රහස්පතින්දා'
    else if (/friday|සිකුරාදා/i.test(t)) r.date = 'සිකුරාදා'
    else if (/saturday|සෙනසුරාදා/i.test(t)) r.date = 'සෙනසුරාදා'
    else if (/sunday|ඉරිදා/i.test(t)) r.date = 'ඉරිදා'
  }

  // ---- Time ----
  const timeRange = t.match(/(\d{1,2})[.:](\d{2})\s*(am|pm|AM|PM)?\s*[-–to]+\s*(\d{1,2})[.:]?(\d{2})?\s*(am|pm|AM|PM)?/i)
  const singleTime = t.match(/(\d{1,2})[.:](\d{2})\s*(am|pm|AM|PM|ට|ta)?/i)
  const timeLabel = /time\s*[-:=]?\s*(\d{1,2})\s*[\/\-–]\s*(\d{1,2})/i.exec(t)
  if (timeRange) {
    let h1 = parseInt(timeRange[1], 10), m1 = timeRange[2], ap1 = (timeRange[3] || '').toLowerCase()
    let h2 = parseInt(timeRange[4], 10), m2 = timeRange[5] || '00', ap2 = (timeRange[6] || '').toLowerCase()
    if (ap1 === 'pm' && h1 < 12) h1 += 12
    if (ap2 === 'pm' && h2 < 12) h2 += 12
    r.time = pad(h1) + ':' + m1 + ' - ' + pad(h2) + ':' + m2
  } else if (timeLabel) {
    let a = parseInt(timeLabel[1], 10)
    let b = parseInt(timeLabel[2], 10)
    // 10/6 in SL ads usually means 10 AM – 6 PM
    if (a <= 12 && b <= 11 && b < a) b += 12
    else if (a <= 11 && b <= 11 && b > a) { /* same meridian ok */ }
    else if (a <= 12 && b <= 8) b += 12
    r.time = pad(a) + ':00 - ' + pad(b) + ':00'
  } else if (singleTime) {
    let h = parseInt(singleTime[1], 10), m = singleTime[2], ap = (singleTime[3] || '').toLowerCase()
    if (ap === 'pm' && h < 12) h += 12
    r.time = pad(h) + ':' + m
  }

  // ---- Duration: hours / days ----
  const hoursM = t.match(/(\d{1,2})\s*(?:hours?|hrs?|පැය|peya\s*keeyak)/i)
  const daysM = t.match(/(\d{1,2})\s*(?:days?|දින|dawas|dawasak)/i)
  if (daysM) r.duration = 'දින ' + daysM[1]
  else if (hoursM) r.duration = 'පැය ' + hoursM[1]
  else if (/full\s*day|පූර්ණ\s*දින/i.test(t)) r.duration = 'Full day'
  // From time range e.g. 10-6 → 8 hours
  if (!r.duration && r.time.includes(' - ')) {
    const parts = r.time.split(' - ')
    if (parts.length === 2) {
      const [h1] = parts[0].split(':').map(Number)
      const [h2] = parts[1].split(':').map(Number)
      if (!isNaN(h1) && !isNaN(h2)) {
        let diff = h2 - h1
        if (diff < 0) diff += 24
        if (diff > 0 && diff <= 16) r.duration = 'පැය ' + diff
      }
    }
  }

  // ---- Payment (never year) ----
  let payText = t.replace(phoneRe, ' ')
  payText = payText.replace(/\b20\d{2}[\/\-.]\d{1,2}[\/\-.]\d{1,2}\b/g, ' ')
  payText = payText.replace(/\b20\d{2}\b/g, ' ')
  let paymentFound = false

  const labeled = payText.match(/(?:payment|peymnt|peya|paymnt|ගෙවීම|salary|rate|pay)\s*[-:=]?\s*(?:rs\.?|රු\.?)?\s*([0-9]{3,6})/i)
  if (labeled) {
    const num = parseInt(labeled[1].replace(/\D/g, ''), 10)
    if (num >= 500 && num <= 100000 && !isYearLike(num)) {
      r.paymentNum = num
      r.payment = 'Rs. ' + num.toLocaleString('en-LK')
      paymentFound = true
    }
  }
  if (!paymentFound) {
    const kStyle = payText.match(/\b(\d{1,2}(?:\.\d)?)\s*[kK]\b/)
    if (kStyle) {
      const num = Math.round(parseFloat(kStyle[1]) * 1000)
      if (num >= 500 && num <= 100000) {
        r.paymentNum = num
        r.payment = 'Rs. ' + num.toLocaleString('en-LK')
        paymentFound = true
      }
    }
  }
  if (!paymentFound) {
    const payPatterns = [
      /(?:rs\.?|රු\.?)\s*([0-9]{3,6})\s*(?:\+|plus)?\s*(food|කෑම|lunch|කැම)?/i,
      /([0-9]{3,6})\s*(?:\+|plus)\s*(food|කෑම|lunch|කැම)/i,
      /([0-9]{3,6})\s*\/\s*-/,
    ]
    for (const re of payPatterns) {
      const m = payText.match(re)
      if (m) {
        const num = parseInt(m[1].replace(/\D/g, ''), 10)
        if (num >= 500 && num <= 100000 && !isYearLike(num)) {
          r.paymentNum = num
          r.payment = 'Rs. ' + num.toLocaleString('en-LK')
          if (m[2]) r.food = true
          paymentFound = true
          break
        }
      }
    }
  }
  if (!paymentFound) {
    const bare = payText.match(/\b([1-9][0-9]{3,4})\b/g)
    if (bare) {
      for (const b of bare) {
        const num = parseInt(b, 10)
        if (num >= 1500 && num <= 15000 && !isYearLike(num)) {
          r.paymentNum = num
          r.payment = 'Rs. ' + num.toLocaleString('en-LK')
          paymentFound = true
          break
        }
      }
    }
  }
  if (!r.food && /food|කෑම|lunch|කැම/i.test(t)) r.food = true

  // ---- Special points (short) ----
  if (/yalu|යාළු|friends?\s*ok|යාළුවෝ/i.test(t)) r.special.push('යාළුවෝ OK')
  if (/ewalema|එන\s*වෙලාවට|same\s*time|ගෙවනවා|payment\s*eka\s*denawa|on\s*arrival/i.test(t)) r.special.push('එන වෙලාවටම ගෙවනවා')
  if (/id\s*(card|eka)?|nic|ජාතික|හැඳුනුම්/i.test(t)) r.special.push('ID ගෙනෙන්න')
  if (/age|වයස/i.test(t)) {
    const age = t.match(/age\s*[-:=]?\s*(\d{2})\s*[-–to]*\s*(\d{2})?/i) || t.match(/වයස\s*(\d{2})\s*[-–]*\s*(\d{2})?/)
    if (age) r.special.push('Age ' + age[1] + (age[2] ? '–' + age[2] : ''))
    else r.special.push('Age limit තියෙනවා')
  }
  if (/uniform|dress\s*code|ඇඳුම/i.test(t)) r.special.push('Dress / Uniform')
  if (/experience|අත්දැකීම|experienced/i.test(t)) r.special.push('Experience ඕනේ')
  if (/no\s*experience|අත්දැකීම\s*අවශ්‍ය\s*නැ/i.test(t)) r.special.push('Experience අවශ්‍ය නැහැ')
  if (/හවස|havas|evening/i.test(t)) r.special.push('හවස් වේලාව')

  // ---- Work type / gender ----
  if (/helper|වැඩ|wedak|help/i.test(t)) r.workType = 'Helper'
  else if (/sales|විකුණුම්|stores?|super|grocery/i.test(t)) r.workType = 'Sales / Store'
  else if (/delivery|ඩෙලිවරි/i.test(t)) r.workType = 'Delivery'
  else if (/cleaning|පිරිසිදු/i.test(t)) r.workType = 'Cleaning'
  else if (/driver|ධාවක/i.test(t)) r.workType = 'Driver'
  else if (/cashier|කැෂියර්/i.test(t)) r.workType = 'Cashier'
  else r.workType = 'General'

  if (/girl\s*or\s*boy|boy\s*or\s*girl/i.test(t)) r.gender = 'Boys / Girls'
  else {
    if (/boy|කොල්ල|පිරිමි|male/i.test(t)) r.gender = 'Boys'
    if (/girl|කෙල්ල|ගැහැණු|female/i.test(t)) r.gender = r.gender ? r.gender + ' / Girls' : 'Girls'
  }
  if (/\bone\b/i.test(t)) r.requirement = '1 දෙනෙක්'
  const numM = t.match(/(?:boy|boys|girl|girls|කොල්ල|දෙනෙක්)\s*(\d)/i) || t.match(/(\d)\s*(?:boy|boys|කොල්ල|දෙනෙක්)/i)
  if (numM) r.requirement = numM[1] + ' දෙනෙක්'

  if (/full\s*time|පූර්ණ/i.test(t)) r.employmentType = 'full-time'
  if (/urgent|dan\s*enna|දැන්|immediate|asap|වහාම/i.test(t)) r.immediate = true

  r.title = [r.workType, r.locations[0] || r.location, r.payment].filter(Boolean).join(' • ') || 'Job'

  // ---- Clean (short, clear) ----
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
  for (const s of r.special) lines.push('✅ ' + s)
  if (r.contact) lines.push('📞 ' + r.contact + (r.contactName ? ' – ' + r.contactName : ''))
  r.clean = lines.join('\n')

  return r
}
