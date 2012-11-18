JSONReceiverURL = "http://foobar";

/**
postJSONRange sends a spreadsheet range to a remote server as JSON-encoded array of objects.
The property names for the rows are read from the first row in the sheet.
The JSON string to is sent in the json parameter of a POST query to JSONReceiverURL.

E.g. Suppose you have a spreadsheet that looks like this
      A  |    B      |    C
1 | Name | Attending | Donation
--|----------------------------
2 | Bob  | No        | 50.00
3 | Kate | Yes       | 75.00
4 | Jo   | No        | 45.00

Doing postJSONRange(sheet.getRange("A2:C3")) would send out a POST request like this:
json=[{"Name":"Bob", "Attending":"No", "Donation":"50.00"}, {"Name":"Kate", "Attending":"Yes", "Donation":"75.00"}]

@param {Object} range The range with the rows to post.
*/
function postJSONRange(range) {
  var firstRow = range.getRow();
  var lastRow = range.getLastRow();
  if (firstRow == 1 && firstRow == lastRow) {
    // Only title row in range, no data to send.
    return;
  }
  // Don't include the title row into the data range.
  firstRow = Math.max(2, firstRow);
  
  var sheet = range.getSheet();

  //  Read the title row to use the titles as property names for the data rows.
  var firstCol = range.getColumn();
  var lastCol = range.getLastColumn();
  var titles = sheet.getRange(1, firstCol, 1, lastCol-firstCol+1).getValues();
  var propertyNames = [];
  for (var j=0; j<titles.length; j++) {
    for (var k=0; k<titles[j].length; k++) {
      propertyNames.push(titles[j][k]);
    }
  }

  // Read the data rows into JavaScript objects.
  // Push the objects into the rows array.
  var values = range.getValues();
  var rows = [];
  for (var i=0; i<values.length; i++) {
    var row = {};
    for (var j=0; j<values[i].length; j++) {
      row[propertyNames[j]] = values[i][j];
    }
    rows.push(row);
  }
  if (rows.length == 0) {
    return;
  }

  // Convert the rows array to a JSON string and send it to JSONReceiverURL using the UrlFetchApp API.
  var postData = JSON.stringify(rows);
  var headers = {};
  var options = {
    "method": "post",
    "headers": headers,
    "payload": "json="+encodeURIComponent(postData)
  };
  var url = JSONReceiverURL;
  var response = UrlFetchApp.fetch(url, options);
};

/**
  postJSONOnEdit sends edited spreadsheet rows to a remote server using postJSONRange.

Add postJSONOnEdit as an onEdit trigger to your spreadsheet to make use of it.
*/
function postJSONOnEdit(e) {
  var sheet = e.range.getSheet();
  postJSONRange(sheet.getRange(e.range.getRow(), 1, e.range.getLastRow()-e.range.getRow()+1, sheet.getLastColumn()));
};