// todo: handle exceptions
// todo: add comments

let db;

// get JSON file
$.getJSON("../seed.json", data => {
    db = data;
});

// helper function for search filter 
function correctNoun(error, array) {
    let correction = "";
    for (i = 0; i < array.length; i++) {
        if (error.includes(array[i])) {
            correction = array[i];
            break;
        } else {
            correction = "invalid";
            continue;
        }
    }
    return correction;
}

// perform filter to search for the keywords
function filter(label) {
    const arr = ["bottle", "can", "foil", "glass", "wool"];
    //let find = correctNoun(label, arr);
    for (i = 0; i < arr.length; i++) {
        if (label.includes(arr[i])) {
            if (!(label.toLowerCase() == arr[i])) {
                label = correctNoun(label, arr);
                break;
            }
        }
    }
    return label;
}

// display DIY container
function showDIY(label) {
    // case insensitive
    label = label.toLowerCase();
    // get data from JSON file
    let data = db[label];

    // if label/data does not exist in database
    if (data == undefined) {
        $('.labels').empty();
        $('.recycle-container').empty();
        let html_temp = `<p>Item cannot be found in our database</p>`;
        $('.recycle-container').append(html_temp);
    } else {
        // empty container
        $('.labels').empty();
        $('.recycle-container').empty();

        // set new content
        for (i = 0; i < data.length; i++) {
            let html_temp = `<div class="card" style="width: 100%;">
            <img class="card-img-top" src="${data[i][2]}" alt="Card image cap">
            <div class="card-body">
              <h5 class="card-title">${data[i][0]}</h5>
              <p class="card-text">${data[i][1]}</p>
              <a href="#" class="btn btn-primary">Go somewhere</a>
            </div>
          </div>`;
            $('.recycle-container').append(html_temp);
        }
    }
}

$(document).ready(function() {
    // on file upload
    $('#file-input').on('change', function() {
        $('#upload-form').submit();
    });

    // when user clicks the appropriate label
    $('.btn-label').click(function() {
        // get html content from button
        let label = $(this).html();
        // display content
        showDIY(label);
    });

    // handle search icon focus
    $('#search-bar').focus(function() {
        $('.ion-md-radio-button-off').css({ 'color': '#489932', 'transition': '0.40s ease' });
    });

    $('#search-bar').focusout(function() {
        $('.ion-md-radio-button-off').css({ 'color': '#fff', 'transition': '0.40s ease' });
    });

    // handle search feature
    $('.ion-md-radio-button-off').click(function() {
        // get search input value 
        let label = $('#search-bar').val();
        // look for keyword
        label = filter(label);
        // if the user input is not empty
        if (label.length != 0) {
            // close navbar on search
            $('#toggle').toggleClass('is-active');
            $('#navbarCollapse').toggleClass('is-active');
            showDIY(label);
        }
    });

    // handle map feature
    $('.map-bar').keypress(function(e) {
        // empty before display
        $('#map').empty();
        if (e.which == 13) {
            $('.map-bar').submit();
            $('#map').empty();
        }
        $('#map').empty();
    });
});
