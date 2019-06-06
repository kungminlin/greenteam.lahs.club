let conf;
const columns = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

let geocoder, map;

$(document).ready(function() {
  $('.tabs').tabs();
  $('.collapsible').collapsible();
  $('.modal').modal();

  $(document).on('click', '.applicant', (e) => {
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: conf.SHEETS_ID,
      range: 'Parking Permit Application Response',
    }).then((response) => {
      var row = response.result.values[parseInt($(e.target).closest('.applicant').attr('data-row-id')) - 1];
      $("#edit-modal ul").empty();
      Object.keys(conf.COLUMN_ID).forEach((key) => {
        $("#edit-modal ul").append("<li class='" + key + "'><b>" + key + "</b>: " + row[getColID(conf.COLUMN_ID[key])] + "</li>");
      })
      $("#edit-modal").attr('data-id') = $(e.target).closest('.applicant').attr('data-row-id');
      var modal = M.Modal.getInstance($("#edit-modal"));
      modal.open();
    })

  })
})

function onLoad() {
  gapi.load('client:auth2', () => {
    $.getJSON("./config.json").then((data) => {
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
    }).catch((error) => {
      console.log(error);
    });
  });
}

function init() {
  $("#login-panel").hide();
  $("#admin-panel").show();
  requestApplicants();
}

function requestApplicants() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: conf.SHEETS_ID,
    range: 'Parking Permit Application Response',
  }).then((response) => {
    var range = response.result;
    $('#applications tbody').empty();
    if (range.values.length > 0) {
      for (i = 1; i < range.values.length; i++) {
        var row = range.values[i];
        var column = conf.COLUMN_ID;
        $('#applications tbody').append("<tr class='applicant " + (row[getColID(column.eligibility)] ? row[getColID(column.eligibility)].toLowerCase() : "") + "' data-row-id='" + (i+1) + "' data-address='" + row[getColID(column.address)] + "'><td class='status'>" + (row[getColID(column.status)] ? row[getColID(column.status)] : "None") + "</td><td class='name'>" + row[getColID(column.firstname)] + " " + row[getColID(column.lastname)] + "</td><td class='class'>" + row[getColID(column.class)] + "</td><td class='email'>" + row[getColID(column.email)] + "</td><td class='eligibility'>" + (row[getColID(column.eligibility)] ? row[getColID(column.eligibility)] : "") + "</td></tr>")
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
    checkEligibility(override, boundary, 0);
  });
}

// Recursively check the geocode to prevent OVER_QUERY_LIMIT
function checkEligibility(override, boundary, i) {
  if (i >= $('.applicant').length) {
    return;
  }
  if (!override && $($('.applicant')[i]).find('.eligibility').text().trim() !== "") {
    checkEligibility(override, boundary, i+1);
  }
  else {
    $target = $($('.applicant')[i])
    geocoder.geocode({'address': $target.attr('data-address')}, (result, status) => {
      if (status === "OK") {
        $target = $($('.applicant')[i]);
        var latLng = new google.maps.LatLng(result[0].geometry.location.lat(), result[0].geometry.location.lng());
        var eligibility = google.maps.geometry.poly.containsLocation(latLng, boundary) ? "Ineligible" : "Eligible";
        update($target.attr('data-row-id'), conf.COLUMN_ID.eligibility, eligibility)
        $target.find('.eligibility').text(eligibility);
        $target.removeClass("ineligible");
        $target.removeClass("eligible");
        $target.addClass(eligibility.toLowerCase());
        checkEligibility(override, boundary, i+1);
      } else {
        console.log(status);
        setTimeout(() => {
          checkEligibility(override, boundary, i);
        }, 1500);
      }
    })
  }
}

function update(id, column, data) {
  gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: conf.SHEETS_ID,
    range: "'Parking Permit Application Response'!" + column + id,
    valueInputOption: "RAW",
    resource: {
      values: [[data]]
    }
  }).then((response) => {
    console.log(response.result);
  })
}

function getCol(id) {
  return columns[id];
}

function getColID(str) {
  if (str.length > 1) return;
  return columns.indexOf(str);
}
