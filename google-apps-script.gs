function doGet() {
  return ContentService.createTextOutput('TailorCraft Academy lead form is active.');
}

function doPost(e) {
  const params = e.parameters || {};

  const payload = {
    name: params.name ? params.name[0] : '',
    email: params.email ? params.email[0] : '',
    phone: params.phone ? params.phone[0] : '',
    city: params.city ? params.city[0] : '',
    interest: params.interest ? params.interest[0] : '',
    message: params.message ? params.message[0] : '',
    page: params.page ? params.page[0] : '',
    visitorInfo: params.visitorInfo ? safeParseJson(params.visitorInfo[0]) : {}
  };

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName('Leads');

  if (!sheet) {
    sheet = spreadsheet.insertSheet('Leads');
    sheet.appendRow([
      'Date',
      'Name',
      'Email',
      'Phone',
      'City',
      'Interest',
      'Message',
      'Visitor Info',
      'Page'
    ]);
  }

  const row = [
    new Date(),
    payload.name || '',
    payload.email || '',
    payload.phone || '',
    payload.city || '',
    payload.interest || '',
    payload.message || '',
    JSON.stringify(payload.visitorInfo || {}),
    payload.page || ''
  ];

  sheet.appendRow(row);

  return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
}

function safeParseJson(value) {
  try {
    return JSON.parse(value || '{}');
  } catch (error) {
    return {};
  }
}
