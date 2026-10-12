// Google Apps Script. Use the prepared private setup file to configure this service.
const SHEET_ID = '18WPlTLIkFRNlr3Z8z7S9VHhYEnwQXpRx4-DQiBFIknE';
const NOTIFY_EMAIL = 'jackdee@att.net';

function setup() {
  const secret = 'REPLACE_WITH_PRIVATE_SETUP_SECRET';
  if (secret === 'REPLACE_WITH_PRIVATE_SETUP_SECRET') throw new Error('Use the prepared TeamPink-Setup.gs file.');
  PropertiesService.getScriptProperties().setProperty('TEAMPINK_SECRET', secret);
  SpreadsheetApp.openById(SHEET_ID).getSheetByName('Orders').getRange('A1:H1').getValues();
  MailApp.getRemainingDailyQuota();
  if (!ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'retryNotifications')) {
    ScriptApp.newTrigger('retryNotifications').timeBased().everyMinutes(10).create();
  }
}

function reply(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let data;
  try { data = JSON.parse(e.postData.contents); } catch (_) { return reply({success:false}); }
  const expected = PropertiesService.getScriptProperties().getProperty('TEAMPINK_SECRET');
  if (!expected || data.secret !== expected) return reply({success:false});
  const limits = {name:120,address:500,phone:40,email:254};
  for (const key in limits) {
    if (typeof data[key] !== 'string' || !data[key].trim() || data[key].length > limits[key]) return reply({success:false});
    data[key] = data[key].trim();
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.phone.replace(/\D/g, '').length < 7 || typeof data.mail !== 'boolean' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.orderId || '')) return reply({success:false});
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return reply({success:false});
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Orders');
    const count = sheet.getLastRow();
    if (count > 1 && sheet.getRange(2, 2, count - 1, 1).createTextFinder(data.orderId).matchEntireCell(true).findNext()) return reply({success:true});
    const cache = CacheService.getScriptCache();
    const bucket = 'orders:' + Math.floor(Date.now() / 60000);
    const current = Number(cache.get(bucket) || 0);
    if (current >= 10) return reply({success:false});
    cache.put(bucket, String(current + 1), 120);
    const clean = value => /^[=+\-@\t\r]/.test(value) ? "'" + value : value;
    const row = count + 1;
    sheet.getRange(row, 2, 1, 6).setNumberFormat('@');
    sheet.getRange(row, 1, 1, 8).setValues([[new Date(), data.orderId, clean(data.name), clean(data.address), clean(data.phone), clean(data.email), data.mail ? 'Yes' : 'No', 'Pending']]);
    SpreadsheetApp.flush();
    try { notify(sheet, row); } catch (_) { /* Saved orders remain Pending; scheduled retry will deliver. */ }
    return reply({success:true});
  } finally { lock.releaseLock(); }
}

function notify(sheet, row) {
  const values = sheet.getRange(row, 1, 1, 8).getValues()[0];
  if (values[7] === 'Sent') return;
  const body = 'A new TeamPink tumbler order was submitted.\n\n' +
    'Name: ' + values[2] + '\nAddress: ' + values[3] + '\nPhone: ' + values[4] +
    '\nEmail: ' + values[5] + '\nMail tumbler: ' + values[6] + '\nOrder reference: ' + values[1] +
    '\n\nThe order will be submitted Monday, October 19, 2026.\n\nOrders: https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit';
  MailApp.sendEmail({to:NOTIFY_EMAIL,subject:'New TeamPink tumbler order submission',body});
  sheet.getRange(row, 8).setValue('Sent');
}

function retryNotifications() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Orders');
    const count = sheet.getLastRow();
    if (count < 2) return;
    const states = sheet.getRange(2, 8, count - 1, 1).getValues();
    let sent = 0;
    for (let i = 0; i < states.length && sent < 20; i++) {
      if (states[i][0] !== 'Pending') continue;
      if (MailApp.getRemainingDailyQuota() < 1) break;
      try { notify(sheet, i + 2); sent++; } catch (_) { break; }
    }
  } finally { lock.releaseLock(); }
}
