(function() {

    /* Declaration/Initialization *******************************/
    var coordinates = document.getElementById('coordinates-input');
    var coordinatesButton = document.getElementById('coordinates-button');
    var getCoordinatesButton = document.getElementById('get-coordinates-button');
    var saveCoordinatesButton = document.getElementById('save-coordinates-button');

    var query = new URL(document.location).searchParams;

    /* Processing ***********************************************/
    /* Update the Coordinates TextBox Using the Query */
    if (query.get('lat') && query.get('long')) {

        coordinates.value = query.get('long') + ', ' + query.get('lat');
    }

    /* Set Event Listeners */
    coordinates.addEventListener('blur', function() {

        var coordinatesArray = processCoordinates(coordinates.value);

        // Test and Demonstrate if Coordinates are Bad
        if (coordinatesArray == undefined && coordinates.value !== '') {

            coordinates.style.border = '1px solid red';
        }
        else {

            coordinates.style.border = '';
        }
    });

    coordinatesButton.addEventListener('click', function() {

        var XMLRequest = new XMLHttpRequest();
        var requestUrl = 'https://api.weather.gov/points/';

        var coordinatesArray = processCoordinates(coordinates.value);

        if (coordinatesArray !== undefined) {

            requestUrl += coordinatesArray[0] + ',' + coordinatesArray[1];

            /* Request Weather Information from NOAA */
            XMLRequest.open('GET', requestUrl);
            XMLRequest.responseType = 'json';
            XMLRequest.send();
            XMLRequest.addEventListener('load', function() {

                handleResponse(XMLRequest.response);
            });
        }
    });

    getCoordinatesButton.addEventListener('click', function() {

        var location;
        var input = document.getElementById('coordinates-input');

        navigator.geolocation.getCurrentPosition(function(position) {

            location = position.coords;

            input.value = location.latitude + ', ' + location.longitude;
        });
    });

    saveCoordinatesButton.addEventListener('click', function() {

        var coordinatesArray = processCoordinates(coordinates.value);
        var urlString = document.location.toString();
        var urlQuery = document.location.search;
        var queryIndexStart = urlString.indexOf('?');

        // If No Query in URL Yet
        if (!urlQuery) {

            // Add Coordinates to URL If Coordinates in Textbox
            if (coordinatesArray) {

                alertUserOfCoordinatesInQuery();

                urlString +=
                    '?long=' + coordinatesArray[0] + '&lat='
                    + coordinatesArray[1];
            }
        }
        else {

            // Remove Coordinates from URL if Textbox Empty
            if (!coordinatesArray) {

                urlString = urlString.substring(0, queryIndexStart);
            }

            // Replace Coordinates in URL If Coordinates in Textbox
            else {

                alertUserOfCoordinatesInQuery();

                urlString =
                    urlString.substring(0, queryIndexStart) + '?long='
                    + coordinatesArray[0] + '&lat='
                    + coordinatesArray[1];
            }
        }

        document.location = urlString;
    });
})();

function processCoordinates(coordinates) {

    var lat = '';
    var long = '';
    var separatorCharacter = '';
    var separatorIndex = '';

    /* Process Latitude and Longitude */
    // Remove Leading and Trailing Whitespace
    coordinates = coordinates.trim();

    // Segregate Latitude and Longitude
    separatorIndex = coordinates.indexOf(', ');
    if (separatorIndex === -1) {

        separatorIndex = coordinates.indexOf(' ');
        if (separatorIndex === -1) {

            var separatorIndex = coordinates.indexOf(',');
            if (separatorIndex === -1) {

                var separatorIndex = coordinates.indexOf('/');
                if (separatorIndex === -1) {

                    return;
                }
                else {

                    separatorCharacter = 'forward slash';
                }
            }
            else {

                separatorCharacter = 'comma';
            }
        }
        else {

            separatorCharacter = 'space';
        }
    }
    else {

        separatorCharacter = 'comma space';
    }

    lat = coordinates.substring(0, separatorIndex);
    if (
        separatorCharacter == 'space'
        || separatorCharacter == 'comma'
        || separatorCharacter == 'forward slash') {

        long = coordinates.substring(separatorIndex + 1);
    }
    else {

        long = coordinates.substring(separatorIndex + 2);
    }

    // Validate Latitude and Longitude
    lat = parseFloat(lat);
    if (isNaN(lat) || lat < -90 || lat > 90) {

        return;
    }

    long = parseFloat(long);
    if (isNaN(long) || long < -180 || long > 180) {

        return;
    }

    // Return Validated Coordinates
    return Array(lat, long);
}

function alertUserOfCoordinatesInQuery() {

    // Notify User That Coordinates are Saved in Search Query
        alert('The coordinates you\'ve entered into the coordinates '
            + 'textbox are about to be saved in the URL (i.e., in your '
            + 'website address bar). If you copy and paste or bookmark '
            + 'the URL after this, you will be copying and pasting, or '
            + 'bookmarking, the coordinates found in the coordinates '
            + 'textbox. While this feature is great for quickly loading '
            + 'the forecast for the same coordinates later on, please '
            + 'be aware that others will be able to see these same '
            + 'coordinates if you send them a copy of the URL while the '
            + 'coordinates are in it.\n\nTo remove coordinates from the '
            + 'URL, simply delete everything in the URL after the '
            + 'question mark, or clear the coordinates textbox and '
            + 'click the "Save These Coordinates" button again.');
}

function handleResponse(theResponse) {

    var XMLRequest = new XMLHttpRequest();
    var requestUrl = theResponse.properties.forecastGridData;
    var forecasts;

    /* Request Detailed Weather Information from NOAA */
    XMLRequest.open('GET', requestUrl);
    XMLRequest.responseType = 'json';
    XMLRequest.send();
    XMLRequest.addEventListener('load', function() {

        forecasts = handleSecondResponse(XMLRequest.response);
        outputHourlyReport(forecasts);
    });
}

function handleSecondResponse(theResponse) {

    var primaryResponse = theResponse.properties;
    var forecasts = {
        updateDate: primaryResponse.updateTime.substring(0, 10),
        updateTime: primaryResponse.updateTime.substring(11, 16),
        elevation: primaryResponse.elevation.value,
        elevationUnits: primaryResponse.elevation.unitCode,
        skyCover: primaryResponse.skyCover.values,
        temperatures: primaryResponse.temperature.values,
        maxTemperatures: primaryResponse.maxTemperature.values,
        minTemperatures: primaryResponse.minTemperature.values,
        apparentTemperatures: primaryResponse.apparentTemperature.values,
        dewPoints: primaryResponse.dewpoint.values,
        heatIndexes: primaryResponse.heatIndex.values,
        windChills: primaryResponse.windChill.values,
        windDirections: primaryResponse.windDirection.values,
        windSpeeds: primaryResponse.windSpeed.values,
        windGusts: primaryResponse.windGust.values,
        probabilityOfPrecipitations: primaryResponse.probabilityOfPrecipitation.values,
        quantitativePrecipitations: primaryResponse.quantitativePrecipitation.values,
        iceAccumulations: primaryResponse.iceAccumulation.values,
        snowFallAmounts: primaryResponse.snowfallAmount.values,
        snowLevels: primaryResponse.snowLevel.values,
        visibility: primaryResponse.visibility.values,
        hazards: primaryResponse.hazards.values,
    };

    /* Processing *********************************************/
    /* Convert Values to Desired Units */
    // Convert Temperatures from Celcius to Fahrenheit
    for (let i = 0; i < forecasts.temperatures.length; i++) {

        forecasts.temperatures[i].value = Number.parseInt(((forecasts.temperatures[i].value * 9) / 5) + 32);
    }

    // Convert Max Temperatures from Celcius to Fahrenheit
    for (let i = 0; i < forecasts.maxTemperatures.length; i++) {

        forecasts.maxTemperatures[i].value = Number.parseInt(((forecasts.maxTemperatures[i].value * 9) / 5) + 32);
    }

    // Convert Min Temperatures from Celcius to Fahrenheit
    for (let i = 0; i < forecasts.minTemperatures.length; i++) {

        forecasts.minTemperatures[i].value = Number.parseInt(((forecasts.minTemperatures[i].value * 9) / 5) + 32);
    }

    // Convert Apparent Temperatures from Celcius to Fahrenheit
    for (let i = 0; i < forecasts.apparentTemperatures.length; i++) {

        forecasts.apparentTemperatures[i].value = Number.parseInt(((forecasts.apparentTemperatures[i].value * 9) / 5) + 32);
    }

    // Convert Dew Points from Celcius to Fahrenheit
    for (let i = 0; i < forecasts.dewPoints.length; i++) {

        forecasts.dewPoints[i].value = Number.parseInt(((forecasts.dewPoints[i].value * 9) / 5) + 32);
    }

    // Convert Wind Directions to N/S/E/W
    for (let i = 0; i < forecasts.windDirections.length; i++) {

        let direction = forecasts.windDirections[i].value

        if (direction >= 315 || direction <= 44) {

            forecasts.windDirections[i].value = 'South';
        }
        else if (direction >= 45 && direction <= 134) {

            forecasts.windDirections[i].value = 'East';
        }
        else if (direction >= 135 && direction <= 224) {

            forecasts.windDirections[i].value = 'North';
        }
        else if (direction >= 224 && direction <= 314) {

            forecasts.windDirections[i].value = 'West';
        }
    }

    // Convert Sky Cover Percent to Cloudy Statement
    for (let i = 0; i < forecasts.skyCover.length; i++) {

        let clouds = forecasts.skyCover[i].value

        if (clouds < 25) {

            forecasts.skyCover[i].value = 'Clear Skies';
        }
        else if (clouds <= 49) {

            forecasts.skyCover[i].value = 'Partially Cloudy';
        }
        else if (clouds <= 74) {

            forecasts.skyCover[i].value = 'Mostly Cloudy';
        }
        else if (clouds <= 100) {

            forecasts.skyCover[i].value = 'Cloudy';
        }
    }

    // Convert Visibility Percent to Visibility Statement
    for (let i = 0; i < forecasts.visibility.length; i++) {

        let visibility = forecasts.visibility[i].value

        if (visibility > 1000) {

            forecasts.visibility[i].value = 'Excellent';
        }
        else if (visibility >= 800) {

            forecasts.visibility[i].value = 'Good';
        }
        else if (visibility >= 600) {

            forecasts.visibility[i].value = 'So-So';
        }
        else if (visibility >= 200) {

            forecasts.visibility[i].value = 'Poor';
        }
        else {

            forecasts.visibility[i].value = 'Really Poor';
        }
    }

    // Convert Dates to Standard American Time Stamp
    for (let i = 0; i < forecasts.temperatures.length; i++) {

        let month = Number.parseInt(forecasts.temperatures[i].validTime.substring(5, 7));
        let day = Number.parseInt(forecasts.temperatures[i].validTime.substring(8, 10));
        let year = Number.parseInt(forecasts.temperatures[i].validTime.substring(0, 4));
        let hour = Number.parseInt(forecasts.temperatures[i].validTime.substring(11, 13));
        let meridianCode = 'am';

        if (hour > 11) {
            meridianCode = 'pm';
        }
        if (hour > 12) {

            hour -= 12;
        }
        else if (hour === 0) {

            hour = 12;
        }

        forecasts.temperatures[i].validTime = month + '/' + day + '/' + year + ' at ' + hour + ' ' + meridianCode;
    }

    return forecasts;

/*
    for (let i = 0; i < forecasts.length; i++) {

        let innerText = '<strong>' + forecasts[i].name + "</strong> (" + forecasts[i].startTime.substring(0, 10) + ")<br>\n";

        innerText += "<div class=\"forecast-content\">";
        innerText += 'From ' + forecasts[i].startTime.substring(11, 16) + ' to ' + forecasts[i].endTime.substring(11, 16) + "<br>\n<br>\n";

        innerText += '<em>Temperature</em>: ' + forecasts[i].temperature + forecasts[i].temperatureUnit + "<br>\n";
        innerText += '<em>Winds</em>: ' + forecasts[i].windDirection + ' at ' + forecasts[i].windSpeed + "<br>\n";
        innerText += '<em>Forecast</em>:<br>\n' + forecasts[i].detailedForecast + "<br>\n<br>\n";

        innerText += "</div>";

        forecastBox.innerHTML += innerText;
    }
*/
}

function outputHourlyReport(forecasts) {

    var forecastMetaBox = document.getElementById('forecast-meta');
    var forecastBox = document.getElementById('forecast');

    // Clear Boxes
    forecastMetaBox.innerHTML = '';
    forecastBox.innerHTML = '';

    // Populate Boxes
    forecastMetaBox.innerHTML += 'Forecast Date: ' + forecasts.updateDate + "<br>\n";
    forecastMetaBox.innerHTML += 'Forecast Time: ' + forecasts.updateTime + " (UTC)<br>\n";
    forecastMetaBox.innerHTML += 'Elevation at Coordinates: ' + forecasts.elevation.toFixed(4);

    for (let i = 0; i < forecasts.temperatures.length; i++) {

        let innerText = '<strong>' + forecasts.temperatures[i].validTime + '</strong><br>';

        innerText += "<div class=\"forecast-content\">";

        if (
            forecasts.skyCover[i] !== undefined
            && forecasts.skyCover[i].value !== null) {

            innerText += forecasts.skyCover[i].value + "<br>\n";
        }

        innerText += '<em>Temperature</em>: ' + forecasts.temperatures[i].value + "F";

        if (
            forecasts.maxTemperatures[i] !== undefined
            && forecasts.maxTemperatures[i].value !== null
            && forecasts.minTemperatures[i] !== undefined
            && forecasts.minTemperatures[i].value !== null) {

            innerText += ' (' + Number.parseInt(forecasts.minTemperatures[i].value) + ' to ' + Number.parseInt(forecasts.maxTemperatures[i].value) + 'F)';
        }

        innerText += "<br>\n";

        if (
            forecasts.windSpeeds[i] !== undefined
            && forecasts.windSpeeds[i].value !== null) {

            innerText += '<em>Winds</em>: ' + Number.parseInt(forecasts.windSpeeds[i].value) + ' ' + forecasts.windDirections[i].value;

            if (
                forecasts.windGusts[i] !== undefined
                && forecasts.windGusts[i].value !== null) {

                innerText += ' with gusts of up to ' + Number.parseInt(forecasts.windGusts[i].value) + ' mph';
            }

            innerText += "<br>\n"
        }

        if (
            forecasts.windChills[i] !== undefined
            && forecasts.windChills[i].value !== null) {

            innerText += '<em>Wind Chill</em>: ' + Number.parseInt(forecasts.windChills[i].value) + "F<br>\n";
        }

        if (
            forecasts.heatIndexes[i] !== undefined
            && forecasts.heatIndexes[i].value !== null) {

            innerText += '<em>Heat Index</em>: ' + Number.parseInt(forecasts.heatIndexes[i].value) + "F<br>\n";
        }

        if (
            forecasts.apparentTemperatures[i] !== undefined
            && forecasts.apparentTemperatures[i].value !== null) {

            innerText += '<em>Feels Like</em>: ' + Number.parseInt(forecasts.apparentTemperatures[i].value) + "F<br>\n";
        }

        if (
            forecasts.probabilityOfPrecipitations[i] !== undefined
            && forecasts.probabilityOfPrecipitations[i].value !== null) {

            innerText += '<em>Rain</em>: ' + forecasts.probabilityOfPrecipitations[i].value + '% chance';

            if (
                forecasts.quantitativePrecipitations[i] !== undefined
                && forecasts.quantitativePrecipitations[i].value !== null
                && forecasts.quantitativePrecipitations[i].value !== 0
                && forecasts.snowFallAmounts[i] !== undefined
                && forecasts.snowFallAmounts[i].value !== null
                && forecasts.snowFallAmounts[i].value !== 0) {

                    innerText += ' to rain ' + Number.parseInt(forecasts.quantitativePrecipitations[i].value) + " inches";

                    innerText += ' and to snow ' + Number.parseInt(forecasts.snowFallAmounts[i].value) + " inches"
            }
            else if (
                forecasts.quantitativePrecipitations[i] !== undefined
                && forecasts.quantitativePrecipitations[i].value !== null
                && forecasts.quantitativePrecipitations[i].value !== 0) {

                    innerText += ' to rain ' + Number.parseInt(forecasts.quantitativePrecipitations[i].value) + " inches";
            }
            else if (
                forecasts.snowFallAmounts[i] !== undefined
                && forecasts.snowFallAmounts[i].value !== null
                && forecasts.snowFallAmounts[i].value !== 0) {

                    innerText += ' to snow ' + Number.parseInt(forecasts.snowFallAmounts[i].value) + " inches";
            }

            innerText += "<br>\n";
        }

        if (
            forecasts.snowLevels[i] !== undefined
            && forecasts.snowLevels[i].value !== null
            && forecasts.snowLevels[i].value !== 0) {

            innerText += '<em>Snow Accumulation</em>: ' + forecasts.snowLevels[i].value + ' feet';

            innerText += "<br>\n";
        }

        if (
            forecasts.iceAccumulations[i] !== undefined
            && forecasts.iceAccumulations[i].value !== null
            && forecasts.iceAccumulations[i].value !== 0) {

            innerText += '<em>Ice Accumulation</em>: ' + forecasts.iceAccumulations[i].value + " inches<br>\n";
        }

        if (
            forecasts.dewPoints[i] !== undefined
            && forecasts.dewPoints[i].value !== null) {

            innerText += '<em>Dew Point</em>: ' + forecasts.dewPoints[i].value + "F<br>\n";
        }

        if (
            forecasts.visibility[i] !== undefined
            && forecasts.visibility[i].value !== null) {

            innerText += '<em>Visibility</em>: ' + forecasts.visibility[i].value + "<br>\n";
        }

        if (
            forecasts.hazards[i] !== undefined
            && forecasts.hazards[i].value !== null) {

            innerText += '<em>Warnings</em>: ' + forecasts.hazards[i].value + "<br>\n";
        }

        innerText += "</div>";

        forecastBox.innerHTML += innerText;
    }
}
