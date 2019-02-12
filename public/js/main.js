// todo: handle exceptions
// todo: add comments

let db;

$.getJSON("../seed.json", data => {
    db = data;
});

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

function showDIY(label) {
    label = label.toLowerCase();
    let data = db[label];

    if (data == undefined) {
        $('.labels').empty();
        $('.recycle-container').empty();
        let html_temp = `<p>Item cannot be found in our database</p>`;
        $('.recycle-container').append(html_temp);
    } else {
        $('.labels').empty();
        $('.recycle-container').empty();

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

    $('.btn-label').click(function() {
        let label = $(this).html();
        showDIY(label);
    });

    // handle search icon focus
    $('#search-bar').focus(function() {
        $('.ion-md-radio-button-off').css({ 'color': '#489932', 'transition': '0.40s ease' });
    });

    $('#search-bar').focusout(function() {
        $('.ion-md-radio-button-off').css({ 'color': '#fff', 'transition': '0.40s ease' });
    });

    $('.ion-md-radio-button-off').click(function() {
        let label = $('#search-bar').val();
        label = filter(label);
        if (label.length != 0) {
            // close navbar on search
            $('#toggle').toggleClass('is-active');
            $('#navbarCollapse').toggleClass('is-active');
            showDIY(label);
        }
    });

    $('.map-bar').keypress(function(e) {
        $('#map').empty();
        if (e.which == 13) {
            $('.map-bar').submit();
            $('#map').empty();
        }
        $('#map').empty();
        // return false;
    });

});