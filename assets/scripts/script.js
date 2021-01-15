$( document ).ready(function() {

    var apiKey = "3afab11cf81659f2859985dced69c5ae";
    var storedHistory = JSON.parse(localStorage.getItem("cityHistory"));
    var cityHistory = [];

    // Loads locally stored city history into the history list
    function init() {
        if (storedHistory !== null) {
            cityHistory = storedHistory;

            for (i = 0; i < cityHistory.length; i++) {
                var ul = $("#cityHistoryList");
                var newli = $("<li>");
                newli.text(cityHistory[i]);
                newli.attr("class", "btn btn-light list-group-item");
                ul.append(newli);
            }
        }
    }

    // Sets the UV Index along with corresponding text & background color
    function updateUV(x) {
        var color = "";
        var fontColor = "";

        if (x < 3) {
            color = "green";
            fontColor = "white";
        } else if (x < 6) {
            color = "yellow";
            fontColor = "black";
        } else if (x < 8) {
            color = "orange";
            fontColor = "black";
        } else if (x < 10) {
            color = "red";
            fontColor = "white";
        } else {
            color = "violet";
            fontColor = "white";
        }

        $("#uvIndex").text(x);
        $("#uvIndex").css("background-color", color);
        $("#uvIndex").css("color", fontColor);
    }

    // Current Weather Data API url
    function getQuery(city) {
        return "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey;
    }

    // One Call API url
    function oneCall(lon,lat) {
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey,
            method: "GET"
        }).then(function(data) {
            updateUV(parseFloat(data.current.uvi));
            updateFiveDay(data);
        });
    }

    // Adds recently searched city to the history list
    function updateHistory(x) {
        var ul = $("#cityHistoryList");
        var newli = $("<li>");

        // Deletes city from history if last search was the same city
        for (i = 0; i < ul.children().length; i++) {
            if (x.name === $("#cityHistoryList").children().eq(i).text()) {
                $("#cityHistoryList").children().eq(i).remove();
            }
        }

        newli.text(x.name);
        newli.attr("class", "btn btn-light list-group-item");
        ul.prepend(newli);

        // Deletes oldest city from history if there are more than 10
        if (ul.children().length > 10) {
            $("#cityHistoryList").children().eq(10).remove();
        }

        // Clears stored history and reloads it with a new one
        cityHistory = [];
        for (i = 0; i < ul.children().length; i++) {
            cityHistory.push($("#cityHistoryList").children().eq(i).text());
        }
        localStorage.setItem("cityHistory", JSON.stringify(cityHistory));
    }

    // Sets the forcast for current day on the main dashboard
    function updateToday(x) {
        var date = new Date(x.dt * 1000);   // Converts the retrieved unix time
        var weatherIcon = $("<img>");

        $("#cityName").empty();             // Empties h3 children to remove the last weather icon
        $("#cityName").removeClass();       // Gets rid of initial padding due to new weather icon adding extra padding

        $("#cityName").text(x.name + " (" + (date.getMonth()) + 1 + "/" + date.getDate() + "/" + date.getFullYear() + ")");
        $("#tempNum").text((x.main.temp * 9/5 - 459.67).toFixed(2) + "°F" );
        $("#humidityNum").text(x.main.humidity + "%");
        $("#windSpeedNum").text((x.wind.speed).toFixed(2) + " MPH");

        // Weather icon
        weatherIcon.attr("src", "http://openweathermap.org/img/wn/" + x.weather[0].icon + "@2x.png");
        weatherIcon.attr("alt", x.weather[0].description);
        $("#cityName").append(weatherIcon);

        updateHistory(x);
        oneCall(x.coord.lon, x.coord.lat);
    }

    // Sets the forcast for the next 5 days
    function updateFiveDay(x) {
        for (i = 1; i < 6; i++) {
            var date = new Date((x.daily[i].dt) * 1000);    // Converts the retrieved unix time
            $("#day" + i).empty();                          // Clears previous results

            var newDate = $("<h5>");
            var newTemp = $("<p>");
            var newHumid = $("<p>");
            var newIcon = $("<img>");

            newDate.attr("class", "py-1");
            newTemp.attr("class", "py-1");

            // Weather icon
            newIcon.attr("src", "http://openweathermap.org/img/wn/" + x.daily[i].weather[0].icon + "@2x.png");
            newIcon.attr("alt", x.daily[i].weather[0].description);

            newDate.text("" + (date.getMonth()) + 1 + "/" + date.getDate() + "/" + date.getFullYear());
            newTemp.text("Temp: " + (x.daily[i].temp.day * 9/5 - 459.67).toFixed(2) + "°F" );
            newHumid.text("Humidity: " + x.daily[i].humidity + "%");

            // i represents the numbered day
            $("#day" + i).append(newDate);
            $("#day" + i).append(newIcon);
            $("#day" + i).append(newTemp);
            $("#day" + i).append(newHumid);
        }
    }

    // Clicking a city from the history list will search it again
    $(document).on("click", ".list-group-item", function() {
        var city = $(this).text();

        $.ajax({
            url: getQuery(city),
            method: "GET"
        }).then(updateToday);
    });


    $("#search-button").click(function(event) {
        event.preventDefault();
        var city = $("#citySearch").val().trim();

        $.ajax({
            url: getQuery(city),
            method: "GET"
        }).then(updateToday);
    });

    init();
});


