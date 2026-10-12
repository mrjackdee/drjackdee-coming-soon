module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({error:'Use POST.'}); }
  const origin = req.headers.origin;
  const allowed = new Set(['https://drjackdee.com', 'https://www.drjackdee.com']);
  if (process.env.VERCEL_URL) allowed.add('https://' + process.env.VERCEL_URL);
  if (origin && !allowed.has(origin)) return res.status(403).json({error:'Invalid request origin.'});
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch { return res.status(400).json({error:'Invalid request.'}); }
  if (!body || typeof body !== 'object') return res.status(400).json({error:'Invalid request.'});
  if (body.website) return res.status(400).json({error:'Invalid submission.'});
  const limits = {name:120,address:500,phone:40,email:254};
  const data = {};
  for (const [key, limit] of Object.entries(limits)) {
    if (typeof body[key] !== 'string' || !body[key].trim() || body[key].length > limit) return res.status(400).json({error:'Please enter a valid ' + key + '.'});
    data[key] = body[key].trim();
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.phone.replace(/\D/g,'').length < 7) return res.status(400).json({error:'Please check your email address and phone number.'});
  if (typeof body.mail !== 'boolean' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.orderId || '')) return res.status(400).json({error:'Invalid order. Please refresh and try again.'});
  data.mail = body.mail; data.orderId = body.orderId;
  const endpoint = process.env.TEAMPINK_SCRIPT_URL;
  const secret = process.env.TEAMPINK_SECRET;
  if (!endpoint || !secret) return res.status(503).json({error:'Ordering is being set up. Please try again shortly or contact Jack Dee at jackdee@att.net.'});
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint)) return res.status(503).json({error:'Ordering is temporarily unavailable. Please contact Jack Dee at jackdee@att.net.'});
  try {
    const upstream = await fetch(endpoint, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,secret}),signal:AbortSignal.timeout(25000),redirect:'follow'});
    const result = await upstream.json();
    if (!upstream.ok || !result.success) throw new Error('Order service unavailable');
    return res.status(200).json({success:true,orderId:data.orderId});
  } catch { return res.status(502).json({error:'We could not confirm your order. Please submit again using this form; duplicate orders are prevented.'}); }
};
