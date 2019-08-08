let conf;
const columns = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

let geocoder, map;
let selected = [];
let anomalies = [];

const Anomaly = {
  ADDRESS_NOT_EXIST: 1,
  NO_AGREEMENT: 2,
  ID_FORMAT: 3,
  MVLA_EMAIL_FORMAT: 4,
  properties: {
    1: {
      name: "address_not_exist",
      desc: "The street address either does not exist, or is too vague for the applicant's eligibility to be classified."
    },
    2: {
      name: "no_agreement",
      desc: "The applicant has refused to comply with the Parking Permit rules."
    },
    3: {
      name: "id_format",
      desc: "The ID number of the applicant is formatted incorrectly."
    },
    4: {
      name: "mvla_email_format",
      desc: "The MVLA email of the applicant is formatted incorrectly."
    }
  }
}

$(document).ready(function() {
  M.AutoInit();

  var lastChecked = null;
  $(document).on('click', '.select input', (e) => {
      var $chkboxes = $('.select input');
      var $target = $(e.target)[0];
      if (!lastChecked) {
          lastChecked = $target;
          return;
      }
      if (e.shiftKey) {
        var start = $chkboxes.index($target);
        var end = $chkboxes.index(lastChecked);
        $chkboxes.slice(Math.min(start,end), Math.max(start,end)+ 1).prop('checked', lastChecked.checked);
      }
      lastChecked = $target;
  });

  $('.select-header input').on('change', (e) => {
    if ($('.select-header input')[0].checked) {
      $('.applicant').each((index, applicant) => {
        selected.push($(applicant).attr('data-row-id'))
      })
      $('.select input').prop('checked', true);
      $('.select-action').show();
    } else {
      resetSelected();
    }
  })

  $(document).on('change', '.select input', (e) => {
    selected = [];
    $('.select input').each((index, e) => {
      if (e.checked) {
        selected.push($(e).closest('.applicant').attr('data-row-id'));
      }
    })
    if (selected.length > 0) {
      $('.select-action').show();
      $('.select-header input').prop('checked', true);
    } else {
      resetSelected()
    }
  })

  $(document).on('click', '.status, .name, .class, .email, .eligibility', (e) => {
    $("<div class='loader'></div>").appendTo("body");
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: conf.SPREADSHEET_ID,
      range: 'Parking Permit Application Response'
    }).then((response) => {
      var row = response.result.values[parseInt($(e.target).closest('.applicant').attr('data-row-id')) - 1];
      $("#info-modal ul").empty();
      Object.keys(conf.PROPERTIES).forEach((key) => {
        $("#info-modal ul").append("<li class='" + key + "'><b>" + conf.PROPERTIES[key].name + "</b>: " + row[getColID(conf.PROPERTIES[key].column_id)] + "</li>");
      })
      $("#info-modal").attr('data-id', $(e.target).closest('.applicant').attr('data-row-id'));

      $('.loader').remove();
      M.Modal.getInstance($("#info-modal")).open();
    }).catch((error) => {
      console.log(error);
      signout();
    })
  })

  $(document).on('click', '.warning', (e) => {
    var error = "";
    var anomaly = anomalies.find(entry => entry.id == $(e.target).closest('.applicant').attr('data-row-id')).errors;
    if (anomaly.length === 1) {
      error = Anomaly.properties[anomaly[0]].name + ": " + Anomaly.properties[anomaly[0]].desc;
    } else {
      error = "<ol>"
      anomaly.forEach((a) => {
        error += "<li>" + Anomaly.properties[a].name + ": " + Anomaly.properties[a].desc + "</li>";
      })
      error += "</ol>"
    }
    M.toast({html: "<i class='material-icons' style='margin-left:0;margin-right:10px;'>error</i>" + error})
  })

  $(document).on('click', '#info-modal .edit', (e) => {
    $("#edit-modal").attr("data-id", $("#info-modal").attr("data-id"));
    $("#info-modal li").each((e, target) => {
      var key = $(target)[0].className;
      var value = $(target).text().split(": ")[1];
      $('#edit-modal #' + key).val(value);
    })
    M.updateTextFields();
    M.Modal.getInstance($("#info-modal")).close();
    M.Modal.getInstance($("#edit-modal")).open()
  })

  $('.select-action.delete').click((e) => {
    if (confirm("Are you sure you want to delete " + selected.length + " applicants?")) {
      var requests = [];
      selected.sort((a, b) => {return b-a}).forEach((id) => {
        requests.push({
          "deleteDimension": {
            "range": {
              "sheetId": conf.SHEETS_ID,
              "dimension": "ROWS",
              "startIndex": id-1,
              "endIndex": id
            }
          }
        })
      })
      gapi.client.sheets.spreadsheets.batchUpdate(
      {
        spreadsheetId: conf.SPREADSHEET_ID,
        requests: requests
      }).then((response) => {
        anomalies = [];
        $('.select input').each((index, e) => {e.checked = false})
        M.toast({html: selected.length + " applicants have been deleted."});
        resetSelected();
        requestApplicants();
      }).catch((error) => {
        console.log(error);
        signout();
      })
    }
  })

  $('.export-selected').click((e) => {
    $("#export-modal").attr('data-mode', 'selected');
    M.Modal.getInstance($("#export-modal")).open();
  })

  $('.export-accepted').click((e) => {
    $("#export-modal").attr('data-mode', 'accepted');
    M.Modal.getInstance($("#export-modal")).open();
  })

  $('.export').click((e) => {
    var properties = [];
    $('.export-prop input:checked').each((i, e) => properties.push($(e).attr('data-property')))
    exportCSV(properties, $("#export-modal").attr('data-mode'));
  })

  $('th').not('.select-header').click((e) => {
    if ($(e.target).closest('th').find('.sort')[0].className.includes("ascending")) {
      sort(e, "descending");
      $('.sort').attr('class', 'sort');
      $(e.target).closest('th').find('.sort').addClass("descending");
    } else {
      sort(e, "ascending");
      $('.sort').attr('class', 'sort');
      $(e.target).closest('th').find('.sort').addClass("ascending");
    }
  })

  $('.select-action.accept').click((e) => {
    var ranges = [];
    selected.forEach((id) => {
      ranges.push({
        "range": "'Parking Permit Application Response'!" + conf.PROPERTIES.status.column_id + id,
        "values": [["Accepted"]]
      })
    })
    gapi.client.sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: conf.SPREADSHEET_ID,
      data: ranges,
      valueInputOption: "RAW"
    }).then((response) => {
      $('.select input').each((index, e) => {e.checked = false})
      M.toast({html: selected.length + " applicants have been accepted."});
      resetSelected();
      requestApplicants();
    }).catch((error) => {
      console.log(error);
      signout();
    })
  })

  $('.select-action.reject').click((e) => {
    var ranges = [];
    selected.forEach((id) => {
      ranges.push({
        "range": "'Parking Permit Application Response'!" + conf.PROPERTIES.status.column_id + id,
        "values": [[""]]
      })
    })
    gapi.client.sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: conf.SPREADSHEET_ID,
      data: ranges,
      valueInputOption: "RAW"
    }).then((response) => {
      $('.select input').each((index, e) => {e.checked = false})
      M.toast({html: selected.length + " applicants have been rejected."});
      resetSelected();
      requestApplicants();
    }).catch((error) => {
      console.log(error);
      signout();
    })
  })

  $(document).on('click', '#info-modal .delete', (e) => {
    if (confirm("Do you wish to delete this applicant?")) {
      id = $(e.target).closest('#info-modal').attr('data-id');
      gapi.client.sheets.spreadsheets.batchUpdate(
      {
        spreadsheetId: conf.SPREADSHEET_ID,
        requests: [{
          "deleteDimension": {
            "range": {
              "sheetId": conf.SHEETS_ID,
              "dimension": "ROWS",
              "startIndex": id-1,
              "endIndex": id
            }
          }
        }]
      }).then((response) => {
        anomalies = []
        M.toast({html: '1 applicant has been deleted.'})
        M.Modal.getInstance($("#info-modal")).close();
        requestApplicants();
      }).catch((error) => {
        console.log(response);
        signout();
      })
    }
  })

  $(document).on('click', '#edit-modal .confirm', (e) => {
    var formdata = new FormData($("#edit-modal form")[0]);
    let data = new Array(26);
    formdata.forEach((value, key) => {
      data[getColID(conf.PROPERTIES[key].column_id)] = value;
    });
    editApplicant($("#edit-modal").attr("data-id"), data);
  })
})

// Google OAuth Authorization
function onLoad() {
  gapi.load('client:auth2', () => {
    $.getJSON("./config.json").then((data) => {
      conf = data;
      gapi.client.init({
        apiKey: conf.API_KEY,
        clientId: conf.CLIENT_ID,
        discoveryDocs: conf.DISCOVERY_DOCS,
        scope: conf.SCOPES
      }).then((response) => {
        $(".loader").remove();
        if (localStorage.ACCESS_TOKEN) {
          gapi.client.setToken({access_token: localStorage.ACCESS_TOKEN});
          init();
        } else {
          gapi.signin2.render('login', {
            'theme': 'light',
            'onsuccess': function() {
              localStorage.ACCESS_TOKEN = gapi.client.getToken().access_token;
              init();
            }
          })
        }
        setupExportModal();
      }).catch((error) => {
        console.log(error);
      })
    }).catch((error) => {
      console.log(error);
    });
  });
}

// Main Initiation
function init() {
  $("#login-panel").hide();
  $("#admin-panel").show();

  initMap();
  requestApplicants();
}

// Queries for applicant data from Google Sheets
function requestApplicants() {
  $("<div class='loader'></div>").appendTo("body");
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: conf.SPREADSHEET_ID,
    range: 'Parking Permit Application Response',
  }).then((response) => {
    var applicant_count = 0;
    var accepted_count = 0;
    var seniors_count = 0;
    var juniors_count = 0;
    var eligible_count = 0;
    var ineligible_count = 0;
    var ev_count = 0;

    var range = response.result;
    $('#applications tbody').empty();
    if (range.values.length > 0) {
      for (i = 1; i < range.values.length; i++) {
        var row = range.values[i];
        var column = conf.PROPERTIES;
        $('#applications tbody').append("<tr class='applicant " + (row[getColID(column.eligibility.column_id)] ? row[getColID(column.eligibility.column_id)].toLowerCase() : "") + " " + (row[getColID(column.status.column_id)] ? row[getColID(column.status.column_id)].toLowerCase() : "") + "' data-row-id='" + (i+1) + "' data-address='" + row[getColID(column.address.column_id)] + "' data-ev='" + (row[getColID(column.ev.column_id)] === "No." ? "false" : "true") + "'><td class='select'><label><input type='checkbox' class='filled-in'><span></span></label></td><td class='status'>" + (row[getColID(column.status.column_id)] ? "<i class='material-icons'>verified_user</i>" : "<i class='material-icons'>remove_circle</i>") + "</td><td class='name'>" + row[getColID(column.firstname.column_id)] + " " + row[getColID(column.lastname.column_id)] + "</td><td class='class'>" + row[getColID(column.class.column_id)] + "</td><td class='email'>" + row[getColID(column.email.column_id)] + "</td><td class='eligibility'>" + (row[getColID(column.eligibility.column_id)] ? (row[getColID(column.eligibility.column_id)] === "Eligible" ? "<i class='material-icons'>verified_user</i>" : "<i class='material-icons'>remove_circle</i>") : "") + "</td></tr>")

        applicant_count++;
        if (row[getColID(column.status.column_id)] === "Accepted") accepted_count++;
        if (row[getColID(column.class.column_id)].includes("2020")) seniors_count++;
        else juniors_count++;
        if (row[getColID(column.eligibility.column_id)] === "Eligible") eligible_count++;
        else ineligible_count++;
        if (row[getColID(column.ev.column_id)] != "No.") ev_count++;

        // Check for Anomalies
        if (!row[getColID(column.agree.column_id)].includes("Yes")) reportAnomaly(i+1, Anomaly.NO_AGREEMENT);
        if ((row[getColID(column.lahs_id.column_id)] + "").length != 5) reportAnomaly(i+1, Anomaly.ID_FORMAT);
        if (!row[getColID(column.mvla_email.column_id)].match("(1000)[0-9]{5}(@mvla.net)")) reportAnomaly(i+1, Anomaly.MVLA_EMAIL_FORMAT);
      }
      verifyEligibility(false);

      $('.applicant-count').text(applicant_count);
      $('.accepted-count').text(accepted_count);
      $('.seniors-count').text(seniors_count);
      $('.juniors-count').text(juniors_count);
      $('.eligible-count').text(eligible_count);
      $('.ineligible-count').text(ineligible_count);
      $('.ev-count').text(ev_count);

      updateWarning();
    } else {
      $('#applications tbody').append('<p>No applicants.</p>');
    }

    $('.sort').attr('class', 'sort');
    $('.loader').remove();
    resetSelected();
  }, function(response) {
    console.log('<p>Error: ' + response.result.error.message + '</p>');
    signout();
  }).catch((error) => {
    console.log(error);
    signout();
  })
}

// Edit applicant and update on spreadsheets
function editApplicant(id, data) {
  gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: conf.SPREADSHEET_ID,
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
  }).catch((error) => {
    console.log(error);
    signout();
  })
}

// Verify that applicant is within geocoded boundary
function verifyEligibility(override) {
  geocoder = new google.maps.Geocoder();

  let boundary = new google.maps.Polyline({
    path: conf.COORDS,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  })
  checkEligibility(override, boundary, 0);
}

// Recursively checks the geocode to prevent OVER_QUERY_LIMIT
function checkEligibility(override, boundary, i) {
  if (i >= $('.applicant').length) {
    if (override) requestApplicants();
    return;
  }
  if (!override && $($('.applicant')[i]).find('.eligibility').text().trim() !== "") {
    checkEligibility(override, boundary, i+1);
  }
  else {
    $target = $($('.applicant')[i])
    geocoder.geocode({'address': $target.attr('data-address')}, (result, status) => {
      if (status === "OK") {
        if (!result[0].types.includes("street_address") && !result[0].types.includes("premise")) {
          reportAnomaly($target.attr('data-row-id'), Anomaly.ADDRESS_NOT_EXIST)
          checkEligibility(override, boundary, i+1);
          return;
        }
        $target = $($('.applicant')[i]);
        var latLng = new google.maps.LatLng(result[0].geometry.location.lat(), result[0].geometry.location.lng());
        var eligibility = google.maps.geometry.poly.containsLocation(latLng, boundary) ? "Ineligible" : "Eligible";
        update($target.attr('data-row-id'), conf.PROPERTIES.eligibility.column_id, eligibility);
        update($target.attr('data-row-id'), conf.PROPERTIES.lat.column_id, result[0].geometry.location.lat());
        update($target.attr('data-row-id'), conf.PROPERTIES.lng.column_id, result[0].geometry.location.lng());
        $target.removeClass("ineligible");
        $target.removeClass("eligible");
        $target.addClass(eligibility.toLowerCase());
        checkEligibility(override, boundary, i+1);
      } else {
        setTimeout(() => checkEligibility(override, boundary, i), 1500);
      }
    })
  }
}

// Helper Function: update a column with data
function update(id, column, data) {
  gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: conf.SPREADSHEET_ID,
    range: "'Parking Permit Application Response'!" + column + id,
    valueInputOption: "RAW",
    resource: {
      values: [[data]]
    }
  }).then()
}

// Initiate interactive Google Maps under "Overview"
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.3866556, lng: -122.1111336},
    zoom: 13
  });
  let boundary = new google.maps.Polygon({
    path: conf.COORDS,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35
  });
  boundary.setMap(map);
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: conf.SPREADSHEET_ID,
    range: 'Parking Permit Application Response',
  }).then((response) => {
    var range = response.result;
    $('#applications tbody').empty();
    if (range.values.length > 0) {
      for (i = 1; i < range.values.length; i++) {
        var row = range.values[i];
        var column = conf.PROPERTIES
        var details = "";
        Object.keys(column).forEach((key) => {
          details += "<p><b>" + column[key].name + "</b>: " + row[getColID(column[key].column_id)] + "</p>";
        })

        var contentString = '<div id="content">'+
      '<div id="siteNotice">'+
      '</div>'+
      '<h4 id="firstHeading" class="firstHeading">' + row[getColID(column.firstname.column_id)] + " " + row[getColID(column.lastname.column_id)] + '</h4>'+
      '<div id="bodyContent">'+
      details
      '</div>'+
      '</div>';

        var infowindow = new google.maps.InfoWindow({content: contentString});

        var marker = new google.maps.Marker({
          position: {lat: parseFloat(row[getColID(column.lat.column_id)]), lng: parseFloat(row[getColID(column.lng.column_id)])},
          map: map,
          title: row[getColID(column.firstname.column_id)] + " " + row[getColID(column.lastname.column_id)]
        });

        google.maps.event.addListener(marker,'click', (function(marker,infowindow) {
          return function() {
            infowindow.open(map,marker);
          };
        })(marker,infowindow));

      }
    }
  }).catch((error) => {
    console.log(error);
    signout();
  })
}

// Helper Function: Get column name by column ID
function getCol(id) {
  return columns[id];
}

// Helper Function: Get column ID by column name
function getColID(str) {
  if (str.length > 1) return;
  return columns.indexOf(str);
}

// Helper Function: Reset Selected
function resetSelected() {
  selected = [];
  $('.select-action').hide();
  $('.select-header input').prop('checked', false);
  $('.select input').prop('checked', false);
}

// Helper Function: Export to CSV
function exportCSV(properties, mode) {
  if (properties.length <= 0 ||
      (mode === "selected" && selected.length == 0) ||
      (mode === "accepted" && parseInt($('.accepted-count').text()) == 0)) {
        M.toast({html: "Error: Nothing to export."})
        return;
      }
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: conf.SPREADSHEET_ID,
    range: 'Parking Permit Application Response',
  }).then((response) => {
    var rows = [[]];
    properties.forEach((prop) => rows[0].push(conf.PROPERTIES[prop].name))

    var range = response.result;
    for (i = 1; i < range.values.length; i++) {
      var row = range.values[i];
      var column = conf.PROPERTIES

      if (mode === "selected") {
        if (selected.includes(i+1 + "")) {
          values = [];
          properties.forEach((prop) => {
            values.push(row[getColID(column[prop].column_id)]);
          })
          rows.push(values);
        }
      } else {
        if (row[getColID(column['status'].column_id)] === "Accepted") {
          values = [];
          properties.forEach((prop) => {
            values.push(row[getColID(column[prop].column_id)]);
          })
          rows.push(values);
        }
      }
    }
    var csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");

    var link = document.createElement('a');
    link.download = "parking-permit-data.csv";
    link.href = csvContent;
    link.click();
  })
}

// Sort applicants
function sort(e, order) {
  var category = $(e.target).closest("th")[0].className;
  var sign = order === "ascending" ? 1 : -1;
  switch (category) {
    case "status-header":
      $('#applications tbody > tr').sort(function(a, b) {
        return sign * ($(a).find('.status > i').text().localeCompare($(b).find('.status > i').text()));
      }).appendTo('#applications tbody');
      break;
    case "name-header":
      $('#applications tbody > tr').sort(function(a, b) {
        return sign * ($(a).find('.name').text().localeCompare($(b).find('.name').text()));
      }).appendTo('#applications tbody');
      break;
    case "class-header":
      $('#applications tbody > tr').sort(function(a, b) {
        return sign * ($(a).find('.class').text().localeCompare($(b).find('.class').text()));
      }).appendTo('#applications tbody');
      break;
    case "email-header":
      $('#applications tbody > tr').sort(function(a, b) {
        return sign * ($(a).find('.class').text().localeCompare($(b).find('.class').text()));
      }).appendTo('#applications tbody');
      break;
    case "eligibility-header":
      $('#applications tbody > tr').sort(function(a, b) {
        return sign * ($(a).find('.eligibility > i').text().localeCompare($(b).find('.eligibility > i').text()));
      }).appendTo('#applications tbody');
      break;
    default:
      break;
  }
}

function setupExportModal() {
  var columnOne = "";
  var columnTwo = "";
  var count = 0;
  Object.entries(conf.PROPERTIES).forEach((property) => {
    if (count++ < Object.keys(conf.PROPERTIES).length / 2) {
      columnOne += "<li class='export-prop'><label><input type='checkbox' class='filled-in' data-property='" + property[0] + "'><span>" + property[1].name + "</span></label></li>";
    } else {
      columnTwo += "<li class='export-prop'><label><input type='checkbox' class='filled-in' data-property='" + property[0] + "'><span>" + property[1].name + "</span></label></li>";
    }
  })
  $(columnOne).appendTo('#export-options > div:eq(0)');
  $(columnTwo).appendTo('#export-options > div:eq(1)');
}

function reportAnomaly(id, anomaly) {
  if (anomalies.findIndex(e => e.id == id) === -1) {
    anomalies.push({
      id: id,
      errors: [anomaly]
    })
  } else {
    report = anomalies.find(e => e.id == id);
    if (report.errors.includes(anomaly)) return;
    else report.errors.push(anomaly);
  }
}

function updateWarning() {
  anomalies.forEach((anomaly) => {
    $('tr.applicant[data-row-id="' + anomaly.id + '"]')
      .addClass('invalid')
      .find('.select').html("<a class='warning btn-floating pulse amber lighten-1'><i class='material-icons'>feedback</i></a>");
  });
}

// Open Spreadsheet
function openSheet() {
  window.open("https://docs.google.com/spreadsheets/d/" + conf.SPREADSHEET_ID + "/edit#gid=" + conf.SHEETS_ID);
}

// Signing Out
function signout() {
  gapi.client.setToken(null);
  localStorage.removeItem("ACCESS_TOKEN");
  window.location.reload();
}
