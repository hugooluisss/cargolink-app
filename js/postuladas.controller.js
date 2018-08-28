function callPostuladas(){
	console.info("Llamando a ofertas postuladas");
	$("#modulo").html(plantillas["postuladas"]);
	setPanel();
	getLista();
	var mapa = undefined;

	function getLista(){
		$.post(server + "listaordenestransportistaspostuladas", {
			movil: true,
			transportista: objUsuario.idTransportista,
		}, function(ordenes){
			$("#dvListaPostuladas").html("");

			if (ordenes.length == 0){
				$("#dvListaPostuladas").html(plantillas['sinOfertas']);
			}

			$.each(ordenes, function(i, orden){
				var plantilla = $(plantillas['oferta']);
				setDatos(plantilla, orden);
				plantilla.attr("json", JSON.stringify(orden));
				var infoWindow = new google.maps.InfoWindow({content: ""});

				plantilla.find(".ver").click(function(){
					var detalle = $(plantillas['detalleOfertaPostulada']);
					var datos = JSON.parse(plantilla.attr("json"));
					setDatos(detalle, datos);
					$("#dvDetalle").html(detalle);

					mapa = new google.maps.Map(document.getElementById("mapa"), {
						center: {lat: datos.origen_json.latitude, lng: datos.origen_json.longitude},
						scrollwheel: true,
						fullscreenControl: true,
						zoom: 10,
						zoomControl: true
					});

					var origen = new google.maps.LatLng(datos.origen_json.latitude, datos.origen_json.longitude);
					var destino = new google.maps.LatLng(datos.destino_json.latitude, datos.destino_json.longitude);

					var directionsService = new google.maps.DirectionsService;
					var directionsDisplay = new google.maps.DirectionsRenderer;
					directionsDisplay.setMap(mapa);
					directionsDisplay.setOptions({
						suppressMarkers: true
					});

					marcaOrigen = new google.maps.Marker({
						icon: "img/truck.png"
					});
					marcaOrigen.setPosition(origen);
					marcaOrigen.setMap(mapa);

					marcaDestino = new google.maps.Marker({
						icon: "img/house.png"
					});
					marcaDestino.setPosition(destino);
					marcaDestino.setMap(mapa);

					directionsService.route({
						origin: origen,
						destination: destino,
						travelMode: 'DRIVING',
						unitSystem: google.maps.UnitSystem.METRIC,
						optimizeWaypoints: true,
					}, function(response, status) {
						if (status === 'OK') {
							directionsDisplay.setDirections(response);

							route = response.routes[0];
							distancia = 0;
							tiempo = 0;
							for(i in route.legs){
								distancia += route.legs[i].distance.value;
								tiempo += route.legs[i].duration.value;
							}

							horas = Math.floor(tiempo / 3600);
							minutos = ((tiempo - horas) / 60).toFixed(0);

							infoWindow.setContent("<b>Distancia: </b>" + (distancia/1000).toFixed(1) + " Km<br /><b>Tiempo: </b>" + horas + ":" + minutos + " horas");
							infoWindow.open(mapa, marcaDestino);
						} else {
							window.alert('Directions request failed due to ' + status);
						}
					});

					$("#dvDetalle").show();
					$("#dvListaPostuladas").hide();

					$(".btnRegresar").click(function(){
						$("#dvDetalle").hide();
						$("#dvListaPostuladas").show();
					});
				});

				$("#dvListaPostuladas").append(plantilla);
			});
		}, "json");
	}
}
