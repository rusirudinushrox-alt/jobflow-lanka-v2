/** Local extraction – NO AI API */

const LOCATIONS: { keys: string[]; name: string; district?: string }[] = [
  { keys: ['රාජගිරිය', 'rajagiriya'], name: 'රාජගිරිය', district: 'Colombo' },
  { keys: ['කොළඹ', 'colombo', 'කොලඹ'], name: 'කොළඹ', district: 'Colombo' },
  { keys: ['නුගේගොඩ', 'nugegoda'], name: 'නුගේගොඩ', district: 'Colombo' },
  { keys: ['මහරගම', 'maharagama'], name: 'මහරගම', district: 'Colombo' },
  { keys: ['කෝට්ටේ', 'kotte'], name: 'කෝට්ටේ', district: 'Colombo' },
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
  { keys: ['වත්තල', 'wattala'], name: 'වත්තල', district: 'Gampaha' },
  { keys: ['කැලණිය', 'kelaniya'], name: 'කැලණිය', district: 'Gampaha' },
  { keys: ['ගම්පහ', 'gampaha'], name: 'ගම්පහ', district: 'Gampaha' },
  { keys: ['නෙගොම්බෝ', 'negombo'], name: 'නෙගොම්බෝ', district: 'Gampaha' },
  { keys: ['ජා-ඇල', 'ja-ela', 'jaela'], name: 'ජා-ඇල', district: 'Gampaha' },
  { keys: ['කඳාන', 'kandana'], name: 'කඳාන', district: 'Gampaha' },
  { keys: ['රාගම', 'ragama'], name: 'රාගම', district: 'Gampaha' },
  { keys: ['මහනුවර', 'kandy'], name: 'මහනුවර', district: 'Kandy' },
  { keys: ['ගාල්ල', 'galle'], name: 'ගාල්ල', district: 'Galle' },
  { keys: ['මාතර', 'matara'], name: 'මාතර', district: 'Matara' },
  { keys: ['කුරුණෑගල', 'kurunegala'], name: 'කුරුණෑගල', district: 'Kurunegala' },
  { keys: ['අනුරාධපුර', 'anuradhapura'], name: 'අනුරාධපුර', district: 'Anuradhapura' },
]

export type Extracted = {
  location: string
  district: string
  time: string
  payment: string
  paymentNum: number
  food: boolean
  date: string
  workType: string
  gender: string
  requirement: string
  contact: string
  contactName: string
  employmentType: 'part-time' | 'full-time'
  immediate: boolean
  clean: string
  title: string
}

function pad(n: number) {
  return n < 10 ? '0' + n : '' + n
}

export function extractAll(text: string): Extracted {
  const t = text || ''
  const lower = t.toLowerCase()
  const r: Extracted = {
    location: '', district: '', time: '', payment: '', paymentNum: 0,
    food: false, date: '', workType: '', gender: '', requirement: '',
    contact: '', contactName: '', employmentType: 'part-time',
    immediate: false, clean: '', title: ''
  }

  // Phone first
  const phoneRe = /(?:0|94|\+94)?[\s-]?7[0-9]{2}[\s-]?[0-9]{3}[\s-]?[0-9]{3,4}/g
  const phones = t.match(phoneRe) || []
  if (phones.length) {
    let p = phones[0].replace(/[\s-]/g, '')
    if (p.startsWith('94')) p = '0' + p.slice(2)
    if (p.length === 9) p = '0' + p
    r.contact = p
  }
  const nameNear = t.match(/(\d{9,11})\s*[💫⭐🌟•\-\s]*([A-Za-z debච-ෆ]{2,18})/i)
  if (nameNear) r.contactName = nameNear[2].trim()

  // Location
  for (const loc of LOCATIONS) {
    for (const k of loc.keys) {
      if (lower.includes(k.toLowerCase()) || t.includes(k)) {
        r.location = loc.name
        r.district = loc.district || ''
        break
      }
    }
    if (r.location) break
  }

  // Time
  const timeRange = t.match(/(\d{1,2})[.:](\d{2})\s*(am|pm|AM|PM)?\s*[-–to]+\s*(\d{1,2})[.:]?(\d{2})?\s*(am|pm|AM|PM)?/i)
  const singleTime = t.match(/(\d{1,2})[.:](\d{2})\s*(am|pm|AM|PM|ට|ta)?/i)
  if (timeRange) {
    let h1 = parseInt(timeRange[1], 10), m1 = timeRange[2], ap1 = (timeRange[3] || '').toLowerCase()
    let h2 = parseInt(timeRange[4], 10), m2 = timeRange[5] || '00', ap2 = (timeRange[6] || '').toLowerCase()
    if (ap1 === 'pm' && h1 < 12) h1 += 12
    if (ap2 === 'pm' && h2 < 12) h2 += 12
    r.time = pad(h1) + ':' + m1 + ' - ' + pad(h2) + ':' + m2
  } else if (singleTime) {
    let h = parseInt(singleTime[1], 10), m = singleTime[2], ap = (singleTime[3] || '').toLowerCase()
    if (ap === 'pm' && h < 12) h += 12
    r.time = pad(h) + ':' + m
  }

  // Payment (avoid phones)
  let payText = t.replace(phoneRe, ' ')
  const payPatterns = [
    /(?:rs\.?|රු\.?)\s*([0-9]{3,6})\s*(?:\+|plus)?\s*(food|කෑම|lunch|කැම)?/i,
    /([0-9]{3,6})\s*(?:\+|plus)\s*(food|කෑම|lunch|කැම)/i,
    /([0-9]{3,6})\s*\/\s*-/,
    /(?:payment|peya|ගෙවීම|salary|rate)\s*[:=]?\s*(?:rs\.?)?\s*([0-9]{3,6})/i,
    /\b([0-9]{4,5})\b/,
  ]
  for (const re of payPatterns) {
    const m = payText.match(re)
    if (m) {
      const num = parseInt(m[1].replace(/\D/g, ''), 10)
      if (num >= 500 && num <= 50000) {
        r.paymentNum = num
        r.payment = 'Rs. ' + num.toLocaleString('en-LK')
        if (m[2] || /food|කෑම|lunch|කැම/i.test(t)) r.food = true
        break
      }
    }
  }
  if (!r.food && /food|කෑම|lunch|කැම/i.test(t)) r.food = true

  // Date
  if (/හෙට|heta|tomorrow/i.test(t)) r.date = 'හෙට'
  else if (/අද|ada|today/i.test(t)) r.date = 'අද'
  else if (/monday|සඳුදා/i.test(t)) r.date = 'සඳුදා'
  else if (/tuesday|අඟහරුවාදා/i.test(t)) r.date = 'අඟහරුවාදා'
  else if (/wednesday|බදාදා/i.test(t)) r.date = 'බදාදා'
  else if (/thursday|බ්‍රහස්පතින්දා/i.test(t)) r.date = 'බ්‍රහස්පතින්දා'
  else if (/friday|සිකුරාදා/i.test(t)) r.date = 'සිකුරාදා'
  else if (/saturday|සෙනසුරාදා/i.test(t)) r.date = 'සෙනසුරාදා'
  else if (/sunday|ඉරිදා/i.test(t)) r.date = 'ඉරිදා'

  // Work type
  if (/helper|වැඩ|wedak|help/i.test(t)) r.workType = 'Helper'
  else if (/sales|විකුණුම්/i.test(t)) r.workType = 'Sales'
  else if (/delivery|ඩෙලිවරි/i.test(t)) r.workType = 'Delivery'
  else if (/cleaning|පිරිසිදු/i.test(t)) r.workType = 'Cleaning'
  else if (/driver|ධාවක/i.test(t)) r.workType = 'Driver'
  else if (/cashier|කැෂියර්/i.test(t)) r.workType = 'Cashier'
  else r.workType = 'General'

  if (/boy|කොල්ල|පිරිමි|male/i.test(t)) r.gender = 'Boys'
  if (/girl|කෙල්ල|ගැහැණු|female/i.test(t)) r.gender = r.gender ? r.gender + ' / Girls' : 'Girls'
  const numM = t.match(/(?:boy|boys|කොල්ල|දෙනෙක්)\s*(\d)/i) || t.match(/(\d)\s*(?:boy|boys|කොල්ල|දෙනෙක්|k\b)/i)
  if (numM) r.requirement = numM[1] + ' දෙනෙක්'

  if (/full\s*time|පූර්ණ/i.test(t)) r.employmentType = 'full-time'
  if (/dan\s*enna|දැන්|immediate|urgent|asap|වහාම|right\s*now/i.test(t)) r.immediate = true

  // Title
  r.title = [r.workType, r.location, r.payment].filter(Boolean).join(' • ') || 'Job'

  // Clean message
  const lines: string[] = []
  if (r.date || r.time) lines.push('📅 ' + (r.date || '') + (r.time ? '  ' + r.time : ''))
  if (r.location) lines.push('📍 ' + r.location + (r.district ? ' (' + r.district + ')' : ''))
  if (r.workType) lines.push('🛠️ ' + r.workType + (r.employmentType === 'full-time' ? ' (Full-time)' : ' (Part-time)'))
  if (r.gender || r.requirement) lines.push('👥 ' + (r.gender || '') + (r.requirement ? ' ' + r.requirement : ''))
  if (r.payment) lines.push('💰 ' + r.payment + (r.food ? ' + කෑම' : ''))
  if (r.immediate) lines.push('⚡ Immediate hiring')
  if (r.contact) lines.push('📞 ' + r.contact + (r.contactName ? ' – ' + r.contactName : ''))
  r.clean = lines.join('\n')

  return r
}
