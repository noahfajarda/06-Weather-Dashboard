// utility functions
function qs(tag) {
    return document.querySelector(tag);
}

function qsALL(tag) {
    return document.querySelectorAll(tag);
}

function capitalizeFirstLetter(string) {
    string = string.split(" ");
    for (var i = 0; i < string.length; i++) {
        string[i] = string[i].charAt(0).toUpperCase() + string[i].slice(1);
    }
    return string.join(" ");
}

// API key hash
// actual API key can be found in the email noahfajarda@gmail.com with subject: 'OpenWeatherMap API Instruction'
var keyHash = "JzqOnXfT01c8qsZzrTsDy";
var API_KEY;
fetch(
    `https://ljgvrb40q2.execute-api.us-west-2.amazonaws.com/dev/keyprr/${keyHash}`
)
    .then((res) => res.json())
    .then(({ data }) => (API_KEY = data));

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

// city & state initalization
var cityInput;
var stateInput;

// all states variable
// prettier-ignore
var availableStates = [ "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];

// autocomplete for entering US state
$(function () {
    $("#stateInput").autocomplete({
        source: availableStates,
    });
});

// disable search button if no text is entered
function enableButton() {
    if (qs("#cityInput").value === "" || qs("#stateInput").value === "") {
        qs("#searchCityButton").disabled = true;
    } else {
        qs("#searchCityButton").disabled = false;
    }
}

// get geo location from open weather map api
function getGeoLocation(query, query2, limit = 7) {
    return fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query},${query2}&limit=${limit}&appid=${API_KEY}`
    );
}

function getWeather(arguments) {
    return fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${arguments.lat}&lon=${arguments.lon}&exclude=hourly,minutely,alerts&units=imperial&appid=b80f4f4a76bd4c6a587f1efe91224ce5`
    );
}

function addCity() {
    cityInput = capitalizeFirstLetter(qs("#cityInput").value);
    stateInput = capitalizeFirstLetter(qs("#stateInput").value);

    getGeoLocation(cityInput, stateInput)
        .then((response) => response.json())
        .then((data) => {
            // try to get lat & lon

            // error handling
            if (data.length == 0) {
                // clear search bar
                var stateError = qs("#stateError");
                invalidUserInput();
                qs("#cityInput").value = stateError.value = "";
                enableButton();
                qs("#clearHistory").disabled = false;
            }
            console.log(data);

            // iterate through list of cities to see if the state matches
            var filteredCity;
            for (var i = 0; i < data.length; i++) {
                // prettier-ignore
                if (data[i].state === stateInput && data[i].name === cityInput) {
                    filteredCity = data[i];
                }
            }
            if (filteredCity === undefined) {
                filteredCity = data[0];
            }

            console.log("Filtered City: ", filteredCity);
            // get weathered data for matched city
            getWeather(filteredCity)
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                    // current weather DISPLAY TOP
                    // prettier-ignore
                    var currentWeather = [data.current.temp, data.current.humidity, data.current.wind_speed];
                    console.log(currentWeather);

                    // 5 day forecast: date, icon, temp, humidity, wind_speed DISPLAY BOTTOM
                    var forecastWeather = [];
                    for (var i = 1; i < 6; i++) {
                        forecastWeather.push({
                            date: new Date(
                                data.daily[i].dt * 1000
                            ).toLocaleDateString(),
                            icon: data.daily[i].weather[0].icon,
                            temperature: data.daily[i].temp.day,
                            humidity: data.daily[i].humidity,
                            wind_speed: data.daily[i].wind_speed,
                        });
                    }
                    console.log(forecastWeather);

                    // append elements with weather data to the container

                    $("#locationName").text(cityInput + ", " + stateInput);
                    $("#temperature").text(currentWeather[0] + "°F");
                    $("#humidity").text(currentWeather[1] + "%");
                    $("#windSpeed").text(currentWeather[2] + " mph");

                    for (var i = 0; i < 5; i++) {
                        $("#date" + i).text(forecastWeather[i].date);
                        $("#temperature" + i).text(
                            forecastWeather[i].temperature + "°F"
                        );
                        $("#humidity" + i).text(
                            forecastWeather[i].humidity + "%"
                        );
                        $("#windSpeed" + i).text(
                            forecastWeather[i].wind_speed + " mph"
                        );
                        $("#icon" + i).html(
                            `<img src=https://openweathermap.org/img/wn/${forecastWeather[i].icon}.png>`
                        );
                    }

                    // create button
                    // add the city to search section
                    var newCityBtn = $("<button></button>");
                    var searchSectionEl = $("#searchSection");
                    // prettier-ignore
                    newCityBtn.addClass(["btn", "btn-secondary", "text-light", "p-3", "mb-2", "city"]);
                    newCityBtn.text(cityInput + ", " + stateInput);
                    searchSectionEl.append(newCityBtn);

                    // display the 2 forecast containers
                    $("#currentWeatherContainer").removeClass("d-none");
                    $("#forecastWeatherContainer").removeClass("d-none");
                });
        });
}

// user input error handling
function invalidUserInput() {
    var timeLeft = 1;
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
