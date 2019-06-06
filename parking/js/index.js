let conf;
const columns = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

let geocoder, map;
let selected;

$(document).ready(function() {
  M.AutoInit();

  var $chkboxes = $('.select input');
  var lastChecked = null;
  $chkboxes.click(function(e) {
      if (!lastChecked) {
          lastChecked = this;
          return;
      }
      if (e.shiftKey) {
        console.log('shift')
        var start = $chkboxes.index(this);
        var end = $chkboxes.index(lastChecked);
        $chkboxes.slice(Math.min(start,end), Math.max(start,end)+ 1).prop('checked', lastChecked.checked);
      }
      lastChecked = this;
  });

  $(document).on('change', '.select input', (e, target) => {
    selected = [];
    $('.select input').each((index, e) => {
      if (e.checked) {
        selected.push($(e).closest('.applicant').attr('data-row-id'));
      }
    })
    if (selected.length > 0) {
      $('.applicant').css({'background-color': 'white'});
      $('.select-action').show();
    } else {
      $('.applicant').css({'background-color': ''});
      $('.select-action').hide();
    }
  })

  $(document).on('click', '.status, .name, .class, .email, .eligibility', (e) => {
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: conf.SHEETS_ID,
      range: 'Parking Permit Application Response'
    }).then((response) => {
      var row = response.result.values[parseInt($(e.target).closest('.applicant').attr('data-row-id')) - 1];
      $("#info-modal ul").empty();
      Object.keys(conf.COLUMN_ID).forEach((key) => {
        $("#info-modal ul").append("<li class='" + key + "'><b>" + key + "</b>: " + row[getColID(conf.COLUMN_ID[key])] + "</li>");
      })
      $("#info-modal").attr('data-id', $(e.target).closest('.applicant').attr('data-row-id'));
      M.Modal.getInstance($("#info-modal")).open();
    })
  })

  $(document).on('click', '#info-modal .edit', (e) => {
    $("#edit-modal").attr("data-id", $("#info-modal").attr("data-id"));
    $("#info-modal li").each((e, target) => {
      var key = $(target).text().split(": ")[0];
      var value = $(target).text().split(": ")[1];
      $('#edit-modal #' + key).val(value);
    })
    M.updateTextFields();
    M.Modal.getInstance($("#info-modal")).close();
    M.Modal.getInstance($("#edit-modal")).open()
  })

  $('.select-action.delete').click((e) => {
    if (confirm("Are you sure you want to delete " + selected.length + " applicants?")) {
      var range = "'Parking Permit Application Response'!";
      selected.forEach((id) => {
        range += id + ":" + id + ",";
      })
      gapi.client.sheets.spreadsheets.values.clear({
        spreadsheetId: conf.SHEETS_ID,
        range: range.slice(-range.length, -1) // Remove last comma;
      }).then((response) => {
        $('.select input').each((index, e) => {e.checked = false})
        M.toast({html: selected.length + " applicants have been deleted."});
        selected = [];
        requestApplicants();
      })
    }
  })

  $('.select-action.accept').click((e) => {
    var ranges = [];
    selected.forEach((id) => {
      ranges.push({
        "range": "'Parking Permit Application Response'!" + conf.COLUMN_ID.status + id,
        "values": [["Accepted"]]
      })
    })
    gapi.client.sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: conf.SHEETS_ID,
      data: ranges,
      valueInputOption: "RAW"
    }).then((response) => {
      $('.select input').each((index, e) => {e.checked = false})
      M.toast({html: selected.length + " applicants have been accepted."});
      selected = [];
      requestApplicants();
    })
  })

  $('.select-action.reject').click((e) => {
    var ranges = [];
    selected.forEach((id) => {
      ranges.push({
        "range": "'Parking Permit Application Response'!" + conf.COLUMN_ID.status + id,
        "values": [[""]]
      })
    })
    gapi.client.sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: conf.SHEETS_ID,
      data: ranges,
      valueInputOption: "RAW"
    }).then((response) => {
      $('.select input').each((index, e) => {e.checked = false})
      M.toast({html: selected.length + " applicants have been rejected."});
      selected = [];
      requestApplicants();
    })
  })

  $(document).on('click', '#info-modal .delete', (e) => {
    if (confirm("Do you wish to delete this applicant?")) {
      gapi.client.sheets.spreadsheets.values.clear({
        spreadsheetId: conf.SHEETS_ID,
        range: "'Parking Permit Application Response'!" + (parseInt($(e.target).closest("#info-modal").attr("data-id"))+1) + ":" + (parseInt($(e.target).closest("#info-modal").attr("data-id"))+1)
      })
    }
  })

  $(document).on('click', '#edit-modal .modal-close', (e) => {
    var formdata = new FormData($("#edit-modal form")[0]);
    let data = new Array(26);
    formdata.forEach((value, key) => {
      data[getColID(conf.COLUMN_ID[key])] = value;
    });
    editApplicant($("#edit-modal").attr("data-id"), data);
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
        $('#applications tbody').append("<tr class='applicant " + (row[getColID(column.eligibility)] ? row[getColID(column.eligibility)].toLowerCase() : "") + " " + (row[getColID(column.status)] ? row[getColID(column.status)].toLowerCase() : "") + "' data-row-id='" + (i+1) + "' data-address='" + row[getColID(column.address)] + "'><td class='select'><label><input type='checkbox' class='filled-in'><span></span></label></td><td class='status'>" + (row[getColID(column.status)] ? "<i class='material-icons'>verified_user</i>" : "<i class='material-icons'>remove_circle</i>") + "</td><td class='name'>" + row[getColID(column.firstname)] + " " + row[getColID(column.lastname)] + "</td><td class='class'>" + row[getColID(column.class)] + "</td><td class='email'>" + row[getColID(column.email)] + "</td><td class='eligibility'>" + (row[getColID(column.eligibility)] ? (row[getColID(column.eligibility)] === "Eligible" ? "<i class='material-icons'>verified_user</i>" : "<i class='material-icons'>remove_circle</i>") : "") + "</td></tr>")
      }
      verifyEligibility(false);
    } else {
      $('#applications tbody').append('<p>No applicants.</p>');
    }
  }, function(response) {
    $('#applications tbody').append('<p>Error: ' + response.result.error.message + '</p>');
  });
}

function editApplicant(id, data) {
  gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: conf.SHEETS_ID,
    range: "'Parking Permit Application Response'!A" + id + ":Z" + id,
    valueInputOption: "RAW",
    resource: {
      values: [data]
    }
  }).then((response) => {
    if (response.status === 200) {
      M.toast({html: "Applicant has been successfully updated"});
      requestApplicants();
    }
  })
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
