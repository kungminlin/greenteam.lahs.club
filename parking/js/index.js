let conf;
const columns = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

let geocoder, map;
let selected;

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

  $(document).on('change', '.select input', (e) => {
    selected = [];
    $('.select input').each((index, e) => {
      if (e.checked) {
        selected.push($(e).closest('.applicant').attr('data-row-id'));
      }
    })
    if (selected.length > 0) {
      $('.applicant').css({'background-color': 'white'});
      $('.select-action').show();
      $('.select-header input').prop('checked', true);
    } else {
      $('.applicant').css({'background-color': ''});
      $('.select-action').hide();
      $('.select-header input').prop('checked', false);
    }
  })

  $(document).on('click', '.status, .name, .class, .email, .eligibility', (e) => {
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: conf.SPREADSHEET_ID,
      range: 'Parking Permit Application Response'
    }).then((response) => {
      var row = response.result.values[parseInt($(e.target).closest('.applicant').attr('data-row-id')) - 1];
      $("#info-modal ul").empty();
      Object.keys(conf.COLUMN_ID).forEach((key) => {
        $("#info-modal ul").append("<li class='" + key + "'><b>" + key + "</b>: " + row[getColID(conf.COLUMN_ID[key])] + "</li>");
      })
      $("#info-modal").attr('data-id', $(e.target).closest('.applicant').attr('data-row-id'));
      M.Modal.getInstance($("#info-modal")).open();
    }).catch((error) => {
      console.log(error);
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
        $('.select input').each((index, e) => {e.checked = false})
        M.toast({html: selected.length + " applicants have been deleted."});
        selected = [];
        requestApplicants();
      }).catch((error) => {
        console.log(error);
      })
    }
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
        "range": "'Parking Permit Application Response'!" + conf.COLUMN_ID.status + id,
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
      selected = [];
      requestApplicants();
    }).catch((error) => {
      console.log(error);
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
      spreadsheetId: conf.SPREADSHEET_ID,
      data: ranges,
      valueInputOption: "RAW"
    }).then((response) => {
      $('.select input').each((index, e) => {e.checked = false})
      M.toast({html: selected.length + " applicants have been rejected."});
      selected = [];
      requestApplicants();
    }).catch((error) => {
      console.log(error);
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
        M.toast({html: '1 applicant has been deleted.'})
        M.Modal.getInstance($("#info-modal")).close();
        requestApplicants();
      }).catch((error) => {
        console.log(response);
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
        var column = conf.COLUMN_ID;
        $('#applications tbody').append("<tr class='applicant " + (row[getColID(column.eligibility)] ? row[getColID(column.eligibility)].toLowerCase() : "") + " " + (row[getColID(column.status)] ? row[getColID(column.status)].toLowerCase() : "") + "' data-row-id='" + (i+1) + "' data-address='" + row[getColID(column.address)] + "' data-ev='" + (row[getColID(column.ev)] === "No." ? "false" : "true") + "'><td class='select'><label><input type='checkbox' class='filled-in'><span></span></label></td><td class='status'>" + (row[getColID(column.status)] ? "<i class='material-icons'>verified_user</i>" : "<i class='material-icons'>remove_circle</i>") + "</td><td class='name'>" + row[getColID(column.firstname)] + " " + row[getColID(column.lastname)] + "</td><td class='class'>" + row[getColID(column.class)] + "</td><td class='email'>" + row[getColID(column.email)] + "</td><td class='eligibility'>" + (row[getColID(column.eligibility)] ? (row[getColID(column.eligibility)] === "Eligible" ? "<i class='material-icons'>verified_user</i>" : "<i class='material-icons'>remove_circle</i>") : "") + "</td></tr>")

        applicant_count++;
        if (row[getColID(column.status)] === "Accepted") accepted_count++;
        if (row[getColID(column.class)].includes("2020")) seniors_count++;
        else juniors_count++;
        if (row[getColID(column.eligibility)] === "Eligible") eligible_count++;
        else ineligible_count++;
        if (row[getColID(column.ev)] != "No.") ev_count++;
      }
      verifyEligibility(false);

      $('.applicant-count').text(applicant_count);
      $('.accepted-count').text(accepted_count);
      $('.seniors-count').text(seniors_count);
      $('.juniors-count').text(juniors_count);
      $('.eligible-count').text(eligible_count);
      $('.ineligible-count').text(ineligible_count);
      $('.ev-count').text(ev_count);
    } else {
      $('#applications tbody').append('<p>No applicants.</p>');
    }
    $('.sort').attr('class', 'sort');
    $('.loader').remove();
  }, function(response) {
    $('#applications tbody').append('<p>Error: ' + response.result.error.message + '</p>');
  }).catch((error) => {
    console.log(error);
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
        $target = $($('.applicant')[i]);
        var latLng = new google.maps.LatLng(result[0].geometry.location.lat(), result[0].geometry.location.lng());
        var eligibility = google.maps.geometry.poly.containsLocation(latLng, boundary) ? "Ineligible" : "Eligible";
        update($target.attr('data-row-id'), conf.COLUMN_ID.eligibility, eligibility)
        update($target.attr('data-row-id'), conf.COLUMN_ID.lat, result[0].geometry.location.lat());
        update($target.attr('data-row-id'), conf.COLUMN_ID.lng, result[0].geometry.location.lng());
        $target.removeClass("ineligible");
        $target.removeClass("eligible");
        $target.addClass(eligibility.toLowerCase());
        checkEligibility(override, boundary, i+1);
      } else {
        setTimeout(() => {
          checkEligibility(override, boundary, i);
        }, 1500);
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
  }).catch((error) => {
    console.log(error);
  })
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
        var column = conf.COLUMN_ID
        var details = "";
        Object.keys(column).forEach((key) => {
          details += "<p><b>" + key + "</b>: " + row[getColID(column[key])] + "</p>";
        })

        var contentString = '<div id="content">'+
      '<div id="siteNotice">'+
      '</div>'+
      '<h4 id="firstHeading" class="firstHeading">' + row[getColID(column.firstname)] + " " + row[getColID(column.lastname)] + '</h4>'+
      '<div id="bodyContent">'+
      details
      '</div>'+
      '</div>';

        var infowindow = new google.maps.InfoWindow({content: contentString});

        var marker = new google.maps.Marker({
          position: {lat: parseFloat(row[getColID(column.lat)]), lng: parseFloat(row[getColID(column.lng)])},
          map: map,
          title: row[getColID(column.firstname)] + " " + row[getColID(column.lastname)]
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
