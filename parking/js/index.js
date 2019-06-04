$(document).ready(function() {
  $('.tabs').tabs();
  $('.collapsible').collapsible();
})

function onLoad() {
  gapi.load('client:auth2', function() {
    $.getJSON("./config.json", function(conf) {
      gapi.client.init({
        apiKey: conf.API_KEY,
        clientId: conf.CLIENT_ID,
        discoveryDocs: conf.DISCOVERY_DOCS,
        scope: conf.SCOPES
      }).then(function() {
        gapi.signin2.render('login', {
          'theme': 'light',
          'onsuccess': function() {
            init();
          }
        })
      });
    })
  });
}

function init() {
  $("#login-panel").hide();
  $("#admin-panel").show();
}

function requestApplicants() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '198eLJwsnq1SYm7u7MoSulSwDfyleg8R6leetDg0bJpQ',
    range: 'Parking Permit Application Response',
  }).then(function(response) {
    var range = response.result;
    $('#applications tbody').empty();
    if (range.values.length > 0) {
      for (i = 0; i < range.values.length; i++) {
        console.log(range);
        var row = range.values[i];
        $('#applications tbody').append("")
        // Print columns A and E, which correspond to indices 0 and 4.
        appendPre(row[0] + ', ' + row[3]);
      }
    } else {
      appendPre('No data found.');
    }
  }, function(response) {
    appendPre('Error: ' + response.result.error.message);
  });
}
