// utility functions
// dynamically create and append elements to specific parents (also accepts ids & classes)
function createEl(element, innerHTML, id = "", classes = "", parent = "") {
    var element = document.createElement(element);
    element.innerHTML = innerHTML;
    // add classes
    if (typeof classes == "object") {
        for (var i = 0; i < classes.length; i++) {
            element.classList.add(classes[i]);
        }
    } else if (classes === "") {
        var nothing = 0;
    } else {
        element.classList.add(classes);
    }
    // add id
    if (id !== "") {
        element.setAttribute("id", id);
    } else {
        var nothing2 = 0;
    }
    // parent
    console.log($(parent));
    console.log(parent);
    if (parent !== "") {
        $(parent).append(element);
    } else {
        document.body.appendChild(element);
    }
}

// create date & running clock El
function createRunningDT() {
    // set current date & time
    // Set text of current day & time
    var currentDay = $("#currentDay");
    var currentTime = $("#currentTime");
    var today = moment();
    currentDay.text(today.format("dddd, MMMM Do, YYYY"));
    $(document).ready(function () {
        currentTime.text(today.format("h:mm:ss A"));
        setInterval(function () {
            today = moment();
            currentTime.text(today.format("h:mm:ss A"));
        }, 1000);
    });
}
createRunningDT();

// event listeners for submit & clear
$("#submitLocation").on("click", submitLocation);
$("#clearBtn").on("click", clearLocationBtns);

// retrieve local storage array or set to new array if null
var savedLocations = JSON.parse(localStorage.getItem("SavedLocations")) || [];
console.log("Saved From LocalStorage:", savedLocations);

// check if local storage retrieval of savedLocations has anything
// if so, make the buttons
if (savedLocations.length !== 0) {
    // display clear btn
    $("#clearBtn").css({ display: "block" });
    for (var i = 0; i < savedLocations.length; i++) {
        createLocationBtn(savedLocations[i].city, savedLocations[i].state);
    }
}

function submitLocation() {
    // get values of user input
    var city = $("#cityInput").val();
    var state = $("#stateInput").val();
    console.log("city: ", city, "    |     state: ", state);

    // turn into object
    var locationObj = {
        city: city,
        state: state,
    };

    // add to array & set local storage to array
    savedLocations.push(locationObj);
    console.log("Saved locations:", savedLocations);
    localStorage.setItem("SavedLocations", JSON.stringify(savedLocations));

    // create button with city & state & show clear Btn
    createLocationBtn(city, state);
    $("#clearBtn").css({ display: "block" });
}

function createLocationBtn(city, state) {
    createEl("button", `${city}, ${state}`, state, "", "#cityList");
}

function clearLocationBtns() {
    localStorage.removeItem("SavedLocations");
    $("#cityList").text("");
    $("#clearBtn").css({ display: "none" });
}

console.log("MR. TELEPHONE MAN");
