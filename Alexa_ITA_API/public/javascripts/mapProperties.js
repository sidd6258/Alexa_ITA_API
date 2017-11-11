var map;

/** Converts numeric degrees to radians **/
function toRadians(Value) {
	return Value * Math.PI / 180;
}

/**Calculating distance between two points using "Haversine Formula" **/
function distanceCalculator(addressCords) {
	console.log("Inside distanceCalculator");
	var totalMeters = [];
	for(var i=0; i<addressCords.length-1; i++)
	{
		//alert("addressCords"+addressCords);
		var startlatCords = addressCords[i][0];
		//alert("startlatCords"+startlatCords);
		var startlngCords = addressCords[i][1];
		//alert("startlngCords"+startlngCords);
		var endlatCords = addressCords[i+1][0];
		//alert("endlatCords"+endlatCords);
		var endlngCords = addressCords[i+1][1];
		//alert("endlngCords"+endlngCords);
		var Radius = 6371; // radius of earth in km
		var lat1 = startlatCords;// StartP.latitude
		//alert("lat1"+lat1);
		var lat2 = endlatCords;// EndP.latitude
		//alert("lat2"+lat2);//undefined
		var lon1 = startlngCords;// StartP.longitude
		//alert("lon1"+lon1);//undefined
		var lon2 = endlngCords;// EndP.longitude
		//alert("lon2"+lon2);//undefined
		var dLat = toRadians(lat2 - lat1);
		//alert("dLat"+dLat);
		var dLon = toRadians(lon2 - lon1);
		//alert("dLon"+dLon);
		var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRadians(lat1))
				* Math.cos(toRadians(lat2)) * Math.sin(dLon / 2)
				* Math.sin(dLon / 2);
		//alert("a "+a);
		var c = 2 * Math.asin(Math.sqrt(a));
		//alert("c"+c);
		var valueResult = Radius * c;
		//alert("valueResult"+valueResult);
		var km = valueResult / 1;
		//alert("km"+km);
		var meter = valueResult % 1000;
		//alert("meter"+meter);
		totalMeters.push(meter);
		//alert("Radius*c"+(Radius * c));
	}
	//alert("totalMeters"+totalMeters);
	return totalMeters;
}

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
function addFeaturesToMultiLoc(map, name, addresses, cords, totalDist, truckReg, product, price) {
	console.log("Inside addFeaturesToMultiLoc");
	var allmarkers= [];
	var alllatlng= [];
	var marker;
	loc = location;
	var infowindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();
	var FARMERS_DOT = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
    var	CUSTOMER_DOT = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
    var TRUCK_DOT = "../images/truck.png";
    var oarr = [];
    var earr = [];
    var iarr = [];
    for (var i = 0; i <=product.length-1; i++) {
    	if(product[i].indexOf('@') == -1){
    		iarr.push(product[i]); 		
    	}else{
    		oarr.push(iarr);
    		iarr = [];
    	}
    }
    earr.push(product[product.length-1]);
    oarr.push(earr);
    console.log("oarr product"+JSON.stringify(oarr));
    for (var i = 0; i <=price.length-1; i++) {
    	//console.log("i"+i);
    	//console.log("price[i]"+price[i]);
    	//console.log("price[i].toString().indexOf('@') "+price[i].toString().indexOf('@'));
    	if(price[i].toString().indexOf('@') == -1){
    		iarr.push(price[i]); 		
    	}else{
    		oarr.push(iarr);
    		iarr = [];
    	}
    }
   
	for (var i = 0; i <=cords.length-1; i++) {
		var lng = cords[i][0];
		var lat = cords[i][1];
		var latlng = new google.maps.LatLng(lng, lat);
		console.log("name"+JSON.stringify(name[i]));
		console.log("address"+JSON.stringify(addresses[i]));
		if(i == 0){
			var content = '<div class="infoWindow2Content">'+"Our valued driver whose name is: "+name[i]
			+". <br/>Currently present at location: "+addresses[i]
			+". <br/>Driving a Truck whose registration number is: "+truckReg
			+". <br/>Distance from this location to the next connected farmer location is: "+totalDist[i].toFixed(2)+' miles.</div>';
		}
		else if(i == cords.length-1){
			var content = '<div class="infoWindow1Content">'+"Our valued customer whose name is: "+name[i]
			+". <br/>Currently present at location: "+addresses[i]+'.</div>';
		}
		else{
			var content = '<div class="infoWindowContent">'+"Our valued farmer whose name is: "+name[i]
			+". <br/>Currently present at location: "+addresses[i]
			+". <br/>Product that needs to be taken from this farmer: "+oarr[i-1]
			+". <br/>Distance from this location to the next connected location is: "+totalDist[i].toFixed(2)+' miles.</div>';
		}
		marker = new google.maps.Marker({
			position : latlng,
			map : map,
			animation: google.maps.Animation.DROP,
			title : 'To know me, click me!!'
		});
		allmarkers.push(marker);
		if(i == 0){
			allmarkers[i].setIcon(TRUCK_DOT);
		}else if(i == cords.length-1){
			allmarkers[i].setIcon(CUSTOMER_DOT);
		}else{
			allmarkers[i].setIcon(FARMERS_DOT);
		}
		google.maps.event.addListener(infowindow, 'closeclick', function() {
			infowindow = null;
		})
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
function builtRoute(addresses) {
	console.log("Inside builtRoute");
	var directionsService = new google.maps.DirectionsService();
	for(var i=0; i<addresses.length-1; i++){
		var directionsRequest = {
				origin : addresses[i],
				destination : addresses[i+1],
				travelMode : google.maps.DirectionsTravelMode.DRIVING,
				unitSystem : google.maps.UnitSystem.METRIC
			};
			if(i == 0){
				var dOptions = {
			            map: map,
			            strokeColor: "#000000"
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
			}else if(i == addresses.length-2){
				var cOptions = {
			            map: map,
			            strokeColor: "#ff4d4d"
			    };
				directionsService.route(directionsRequest, function(response, status) {
					if (status == google.maps.DirectionsStatus.OK) {
						new google.maps.DirectionsRenderer({
							map : map,
							directions : response,
							suppressMarkers: true,
							polylineOptions: cOptions
						});
					} else
						$("#error").append("Unable to retrieve your route<br />");
				});
			}else if(i>0 && i<addresses.length-2){
				var fOptions = {
			            map: map,
			            strokeColor: "#2eb82e"
			    };
				directionsService.route(directionsRequest, function(response, status) {
					if (status == google.maps.DirectionsStatus.OK) {
						new google.maps.DirectionsRenderer({
							map : map,
							directions : response,
							suppressMarkers: true,
							polylineOptions: fOptions
						});
					} else
						$("#error").append("Unable to retrieve your route<br />");
				});
			}
	}
}

/**Initiating the whole process**/
function initiate(nameArr, addressArr, truckReg, product, price) {
	console.log("Inside initiate");
	//console.log("nameArr"+nameArr);
	//console.log("addressArr"+addressArr);
	var addressCords = [];
	var counter = 0;
	for (var index = 0; index < addressArr.length; index++) {
		getCoordinates(addressArr[index], function(latLng) {
			addressCords.push(latLng);
			counter++;
			if (counter == addressArr.length) {
				map = initMap(new google.maps.LatLng(addressCords[addressArr.length-1][0],
						addressCords[addressArr.length-1][1]));
				builtRoute(addressArr);
				var totalDist = distanceCalculator(addressCords);
				//console.log("totalDist------>" + totalDist);
				addFeaturesToMultiLoc(map, nameArr, addressArr, addressCords, totalDist, truckReg, product, price);
			}
		});
	}
}