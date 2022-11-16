// utility functions
// dynamically create and append elements to specific parents (also accepts ids & classes)
// prettier-ignore
function createEl(element, innerHTML, id = "", classes = "", parent = "", prepend = "") {
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
    // console.log(parent);
    if (parent !== "") {
        if (prepend == "prepend") {
            $(parent).prepend(element);
        } else {
            $(parent).append(element);
        }
    } else {
        if (prepend == "prepend") {
            document.body.appendChild(element);
        } else {
            document.body.appendChild(element);
        }
    }
}

// capitalize first letter of string
function capitalizeFirstLetter(string) {
    string = string.split(" ");
    for (var i = 0; i < string.length; i++) {
        string[i] = string[i].charAt(0).toUpperCase() + string[i].slice(1);
    }
    return string.join(" ");
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

// all states variable
// prettier-ignore
var availableStates = [ "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];
// autocomplete for entering US state
$(function () {
    $("#stateInput").autocomplete({
        source: availableStates,
    });
});

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

// when user presses submit button
function submitLocation() {
    // get values of user input
    var city = capitalizeFirstLetter($("#cityInput").val());
    var state = capitalizeFirstLetter($("#stateInput").val());

    // retrieve the city data
    retrieveCityWeatherData(city, state);

    console.log("city: ", city, "    |     state: ", state);

    // turn into object
    var locationObj = {
        city: city,
        state: state,
    };

    for (var i = 0; i < savedLocations.length; i++) {
        if (
            savedLocations[i]["city"] == city &&
            savedLocations[i]["state"] == state
        ) {
            return;
        }
    }
    // add to array & set local storage to array
    savedLocations.push(locationObj);
    localStorage.setItem("SavedLocations", JSON.stringify(savedLocations));

    // create button with city & state, show clear Btn, & clear search section
    createLocationBtn(city, state);
    $("#clearBtn").css({ display: "block" });
    $("#cityInput").val("");
    $("#stateInput").val("");

    // clear input text & disable button
    enableButton();
}

// create button to be displayed in search section
function createLocationBtn(city, state) {
    // checking if state !== null
    if (state === "") {
        // prettier-ignore
        createEl("button", `${city}`, city.replaceAll(" ", ""), "", "#cityList");
    } else {
        // repplace all function === removes spaces when creating btn ID
        // prettier-ignore
        createEl("button", `${city}, ${state}`, city.replaceAll(" ", ""), ["btn", "btn-secondary", "text-light", "p-3", "mb-2", "city"], "#cityList", "prepend");
    }

    $("#" + city.replaceAll(" ", "")).on("click", function () {
        $("#cityInput").val(city);
        $("#stateInput").val(state);
        retrieveCityWeatherData(city, state);
    });
}

// clear local storage & remove city buttons
function clearLocationBtns() {
    localStorage.removeItem("SavedLocations");
    // reset saved locations array
    savedLocations = [];
    $("#cityList").text("");
    $("#clearBtn").css({ display: "none" });
    $("#dataContainer").css("height", "600px");
    // hide displayed data
    $("#currentWeatherContainer").addClass("d-none");
    $("#forecastWeatherContainer").addClass("d-none");
}

// get necessary data from API & store in data structure
function retrieveCityWeatherData(city, state) {
    getGeoLocation(city, state)
        .then((res) => res.json())
        .then((data) => {
            // there are multiple states with the same city
            // this filters for the city within the specified state
            var filteredCity = filterState(data, city, state);

            // get the weather for this city
            getWeather(filteredCity)
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                    // retrieves CURRENT and FORECAST weather data
                    var currentWeather = getCurrent(data);
                    var forecastWeather = getForecast(data);

                    // prettier-ignore
                    displayData(currentWeather, forecastWeather, filteredCity.name, filteredCity.state);
                });
        })
        // error handling
        .catch((error) => {
            console.error("There was an error!", error);
            invalidUserInput();
            $("#" + city.replaceAll(" ", "")).remove();
            // reset text box values
            $("#cityInput").val("");
            $("#stateInput").val("");
            savedLocations.pop();
            // reassign local storage
            localStorage.setItem(
                "SavedLocations",
                JSON.stringify(savedLocations)
            );
            // remove clear btn if there's nothing in the city list
            if ($("#cityList button").length === 0) {
                $("#clearBtn").css("display", "none");
            }
        });
}

// user input error handling
function invalidUserInput() {
    var timeLeft = 2;
    $("#stateError").addClass("d-block").removeClass("d-none");
    var timeInterval = setInterval(function () {
        timeLeft--;
        if (timeLeft === -1) {
            clearInterval(timeInterval);
            $("#stateError").addClass("d-none").removeClass("d-block");
        }
        return;
    }, 1000);
}

// filters for the city within the specified state
function filterState(data, city, state) {
    // iterate through list of cities to see if the state matches
    var filteredCity;
    for (var i = 0; i < data.length; i++) {
        // prettier-ignore
        if (data[i].state === state && data[i].name === city) {
            filteredCity = data[i];
        }
    }
    if (filteredCity === undefined) {
        filteredCity = data[0];
    }
    return filteredCity;
}
// retrieves CURRENT weather data for selected city
function getCurrent(data) {
    // data for CURRENT weather in city (displayed on top)
    // temp, humidity, wind speed
    var currentWeather = {
        Temperature: data.current.temp,
        Humidity: data.current.humidity,
        "Wind Speed": data.current.wind_speed,
        icon: data.current.weather[0].icon,
        description: data.current.weather[0].description,
    };
    return currentWeather;
}
// retrieves FORECAST weather data for selected city
function getForecast(data) {
    // data for 5-DAY FORECAST in city (displayed on bottom)
    // date, icon, temp, humidity, wind speed
    var forecastWeather = [];
    for (var i = 1; i < 6; i++) {
        forecastWeather.push({
            date: new Date(data.daily[i].dt * 1000).toLocaleDateString(),
            temperature: data.daily[i].temp.day,
            humidity: data.daily[i].humidity,
            wind_speed: data.daily[i].wind_speed,
            icon: data.daily[i].weather[0].icon,
            description: data.daily[i].weather[0].description,
        });
    }
    return forecastWeather;
}

// displays data to the UI
function displayData(currentWeather, forecastWeather, city, state) {
    // format and display containers
    $("#dataContainer").css("height", "fit-content");
    $("#currentWeatherContainer").removeClass("d-none");
    $("#forecastWeatherContainer").removeClass("d-none");

    // display current weather
    if (state === "") {
        $("#locationName").text(city);
    } else {
        $("#locationName").text(city + ", " + state);
    }
    $("#temperature").text(currentWeather.Temperature + "°F");
    $("#humidity").text(currentWeather.Humidity + "%");
    $("#windSpeed").text(currentWeather["Wind Speed"] + " mph");
    $("#iconMain").html(
        `<em>${capitalizeFirstLetter(
            currentWeather.description
        )}</em> <img src=https://openweathermap.org/img/wn/${
            currentWeather.icon
        }.png>`
    );

    // display 5-day forecast (date, icon, temp, humidity, & windspeed)
    for (var i = 0; i < 5; i++) {
        $("#date" + i).text(forecastWeather[i].date);
        $("#icon" + i).html(
            `<em>${capitalizeFirstLetter(
                forecastWeather[i].description
            )}</em> <img src=https://openweathermap.org/img/wn/${
                forecastWeather[i].icon
            }.png>`
        );
        $("#temperature" + i).text(forecastWeather[i].temperature + "°F");
        $("#humidity" + i).text(forecastWeather[i].humidity + "%");
        $("#windSpeed" + i).text(forecastWeather[i].wind_speed + " mph");
    }
}

// buttons will only enable if text is inputted in both fields
function enableButton() {
    if ($("#cityInput").val() === "" || $("#stateInput").val() === "") {
        $("#submitLocation").prop("disabled", true);
    } else {
        $("#submitLocation").prop("disabled", false);
    }
}

if ($("#cityInput").val() === "" || $("#stateInput").val() === "") {
    $("#submitLocation").prop("disabled", true);
}

// DATA FROM API
// get geo location from open weather map api
function getGeoLocation(query, query2, limit = 7) {
    return fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query},${query2}&limit=${limit}&appid=b80f4f4a76bd4c6a587f1efe91224ce5`
    );
}
function getWeather(arguments) {
    return fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${arguments.lat}&lon=${arguments.lon}&exclude=hourly,minutely,alerts&units=imperial&appid=b80f4f4a76bd4c6a587f1efe91224ce5`
    );
}
