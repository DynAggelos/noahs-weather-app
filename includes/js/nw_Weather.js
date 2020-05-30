class nw_Weather {

    constructor() {

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
    }
}
