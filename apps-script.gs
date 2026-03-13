// =====================================================================
// Google Apps Script – Vishwanatha Printers Enquiry Form Handler
// =====================================================================
// SETUP STEPS:
// 1. Open https://script.google.com and create a new project
// 2. Paste this entire script
// 3. Replace SHEET_ID below with your Google Sheet's ID (from its URL)
// 4. Click Deploy > New Deployment > Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 5. Copy the Web App URL and paste it into script.js (APPS_SCRIPT_URL)
// =====================================================================

const SHEET_ID = '1cRFGpVACz4ZcRYOKcnDu9qPEARY1DGxuxt9ErmYXLYo'; // ← Replace this
const SHEET_NAME = 'Enquiries';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    appendToSheet(data);
    return buildResponse({ status: 'success', message: 'Enquiry saved' });
  } catch (err) {
    return buildResponse({ status: 'error', message: err.toString() });
  }
}

function doGet(e) {
  return buildResponse({ status: 'alive', message: 'Vishwanatha Printers Form API is running' });
}

function appendToSheet(data) {
  const ss    = SpreadsheetApp.openById(SHEET_ID);
  let sheet   = ss.getSheetByName(SHEET_NAME);

  // Create sheet with headers if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = [
      'Timestamp', 'Name', 'Phone', 'Email',
      'Print Type', 'Quantity', 'Paper Type', 'Print Size',
      'Notes / Description', 'Source'
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#6d28d9')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    data.timestamp   || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    data.name        || '',
    data.phone       || '',
    data.email       || '',
    data.printType   || '',
    data.quantity    || '',
    data.paperType   || '',
    data.printSize   || '',
    data.notes       || '',
    data.source      || 'Website'
  ]);

  // Optional: Send email notification to the business owner
  sendNotificationEmail(data);
}

function sendNotificationEmail(data) {
  const ownerEmail = 'vishwanathaprintershunsur@gmail.com';
  const subject    = `New Print Enquiry from ${data.name} – ${data.printType}`;
  const body = `
New Printing Enquiry Received!
=================================
Name:       ${data.name}
Phone:      ${data.phone}
Email:      ${data.email || 'Not provided'}
Print Type: ${data.printType}
Quantity:   ${data.quantity}
Paper Type: ${data.paperType || 'Not specified'}
Print Size: ${data.printSize || 'Not specified'}
Notes:      ${data.notes || 'None'}
Timestamp:  ${data.timestamp}
Source:     ${data.source}
=================================
Reply quickly to win the customer!
  `;
  try {
    MailApp.sendEmail(ownerEmail, subject, body);
  } catch (e) {
    // Email sending failed – enquiry still saved to sheet
    console.log('Email notification failed: ' + e.toString());
  }
}

function buildResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
