let conf;
const columns = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

let geocoder, map;

$(document).ready(function() {
  $('.tabs').tabs();
  $('.collapsible').collapsible();
})

function onLoad() {
  gapi.load('client:auth2', function() {
    $.getJSON("./config.json", function(data) {
      conf = data;
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
    spreadsheetId: conf.SHEETS_ID,
    range: 'Parking Permit Application Response',
  }).then(function(response) {
    var range = response.result;
    $('#applications tbody').empty();
    if (range.values.length > 0) {
      for (i = 1; i < range.values.length; i++) {
        var row = range.values[i];
        var column = conf.COLUMN_ID;
        $('#applications tbody').append("<tr class='applicant' data-row-id='" + (i+1) + "' data-address='" + row[getColID(column.address)] + "'><td class='status'>" + (row[getColID(column.status)] ? row[getColID(column.status)] : "None") + "</td><td class='name'>" + row[getColID(column.firstname)] + " " + row[getColID(column.lastname)] + "</td><td class='class'>" + row[getColID(column.class)] + "</td><td class='email'>" + row[getColID(column.email)] + "</td><td class='eligibility'>" + (row[getColID(column.eligibility)] ? row[getColID(column.eligibility)] : "") + "</td></tr>")
      }
      verifyEligibility(false);
    } else {
      $('#applications tbody').append('<p>No applicants.</p>');
    }
  }, function(response) {
    $('#applications tbody').append('<p>Error: ' + response.result.error.message + '</p>');
  });
}

function verifyEligibility(override) {
  geocoder = new google.maps.Geocoder();

  $.getJSON("./coords.json", function(coords) {
    let boundary = new google.maps.Polyline({
      path: coords,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    })
    $('.applicant').each(function(e, target) {
      if ($(target).find('.eligibility').text().trim() === "" || override) geocoder.geocode({'address': $(target).attr('data-address')}, function(result, status) {
        if (status === "OK") {
          var latLng = new google.maps.LatLng(result[0].geometry.location.lat(), result[0].geometry.location.lng());
          var eligibility = google.maps.geometry.poly.containsLocation(latLng, boundary) ? "Eligible" : "Ineligible";
          update($(target).attr('data-row-id'), conf.COLUMN_ID.eligibility, eligibility)
          $(target).find('.eligibility').text(eligibility);
          $(target).addClass(eligibility.toLowerCase());
        } else {
          console.log(status);
        }
      })
    })
  });
}

function update(id, column, data) {
  gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: conf.SHEETS_ID,
    range: "'Parking Permit Application Response'!" + column + id,
    valueInputOption: "RAW",
    resource: {
      values: [[data]]
    }
  }).then(function(response) {
    console.log(response.result);
  })
}

function getCol(id) {
  return columns[id];
}

function getColID(str) {
  if (str.length > 1) return null;
  return columns.indexOf(str);
}
