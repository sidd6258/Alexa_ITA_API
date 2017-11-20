
var map;

/**Get coordinates from address**/
function getCoordinates(address, callbackfun) {
    console.log("Inside getCoordinates");
    var latLng = [];
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
        'address' : address
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            latLng.push(results[0].geometry.location.lat());
            latLng.push(results[0].geometry.location.lng());
            callbackfun(latLng);
        } else {
            alert("Geocode was not successful for the following reason: "
                + status);
        }
    });
}

/**Adding features like markers and info windows**/
function addFeaturesToMultiLoc(map, name, cords) {
	console.log("Inside addFeaturesToMultiLoc");
	var allmarkers= [];
	var alllatlng= [];
	var marker;
	var infowindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();
    var lng,lat,latlng,content;
	for (var i=0; i<cords.length; i++) {
		lng = cords[i][0];
		lat = cords[i][1];
		latlng = new google.maps.LatLng(parseFloat(lng), parseFloat(lat));
        content = '<div class="infoWindow2Content">'+name[i]+'</div>';
		marker = new google.maps.Marker({
			position : latlng,
			map : map,
			animation: google.maps.Animation.DROP,
			title : 'Click me!'
		});
		allmarkers.push(marker);
		google.maps.event.addListener(infowindow, 'closeclick', function() {
			infowindow = null;
		});
		google.maps.event.addListener(marker, 'click', (function(marker,
				content, infowindow) {
			return function() {
				infowindow.setContent(content);
				infowindow.open(map, marker);
			}
		})(marker, content, infowindow));
		alllatlng.push(latlng);
	}
	for(var j=0; j<alllatlng.length; j++)
		bounds.extend(alllatlng[j]);
	map.fitBounds(bounds);
}

/**Creating a map**/
function initMap(latlng) {
	console.log("Inside initMap");
	var myOptions = {
		zoom : 4,
		center : latlng,
		mapTypeId : google.maps.MapTypeId.ROADMAP,
		zoomControl : true,
		zoomControlOptions : {
			style : google.maps.ZoomControlStyle.LARGE,
			position : google.maps.ControlPosition.RIGHT_CENTER
		}
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	return map;
}

/**Building a route from source location to destination location**/
function builtRoute(source, destination) {
	console.log("Inside builtRoute");
	var directionsService = new google.maps.DirectionsService();
    var directionsRequest = {
        origin : source,
        destination : destination,
        travelMode : google.maps.DirectionsTravelMode.DRIVING,
        unitSystem : google.maps.UnitSystem.METRIC
    };
    var dOptions = {
            map: map,
            strokeColor: "#1c2a48"
    };
    directionsService.route(directionsRequest, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            new google.maps.DirectionsRenderer({
                map : map,
                directions : response,
                suppressMarkers: true,
                polylineOptions: dOptions
            });
        } else
            $("#error").append("Unable to retrieve your route<br />");
    });
}

/**Initiating the whole process**/
function initiate(booking) {
	console.log("Inside initiate");
    var tempArr = [];
    var addressCords = [];
    var counter = 0;
    tempArr.push(booking.source);
    tempArr.push(booking.destination);
    for (var index=0; index<tempArr.length; index++) {
        getCoordinates(tempArr[index], function(latLng) {
            addressCords.push(latLng);
            counter++;
            if (counter == tempArr.length) {
                map = initMap(new google.maps.LatLng(parseFloat(addressCords[tempArr.length-1][0]),
                    parseFloat(addressCords[tempArr.length-1][1])));
                builtRoute(tempArr);
                addFeaturesToMultiLoc(map, tempArr, addressCords);
            }
        });
    }
}
