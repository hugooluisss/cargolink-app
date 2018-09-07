function callAdjudicadas(){
	console.info("Llamando a ofertas adjudicadas");
	$("#modulo").html(plantillas["adjudicadas"]);
	setPanel();
	getLista();
	var mapa = undefined;

	function getLista(){
		$.post(server + "listaordenestransportistasadjudicadas", {
			movil: true,
			transportista: objUsuario.idTransportista,
		}, function(ordenes){
			$("#dvListaAdjudicadas").html("");

			if (ordenes.length == 0){
				$("#dvListaAdjudicadas").html(plantillas['sinOfertas']);
			}

			$.each(ordenes, function(i, orden){
				var plantilla = $(plantillas['oferta']);
				setDatos(plantilla, orden);
				plantilla.attr("json", JSON.stringify(orden));

				plantilla.find(".ver").click(function(){
					var detalle = $(plantillas['detalleOfertaAdjudicada']);
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
					var infoWindow = new google.maps.InfoWindow({content: ""});
					var idOrden = window.localStorage.getItem("idOrden");
					var gpsPrincipal = undefined;
					navigator.geolocation.getCurrentPosition(function(gps){
						gpsPrincipal = gps;
						marcaActual = new google.maps.Marker({
							position: new google.maps.LatLng(gps.coords.latitude, gps.coords.longitude),
							title: "Posición actual",
							icon: "img/posicionActual.png"
						});
						marcaActual.setMap(mapa);

						if (idOrden == datos.idOrden){//Quiere decir que está en ruta
							salida = new google.maps.LatLng(gps.coords.latitude, gps.coords.longitude);
							entrega = destino;
						}else{
							salida = origen;
							entrega = destino;
						}


						directionsService.route({
							origin: salida,
							destination: entrega,
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

								infoWindow.setContent('<i class="fa fa-car" aria-hidden="true"></i> ' + Math.floor(horas) + ' hrs ' + Math.floor(minutos) + ' min<br /><small>' + (distancia/1000).toFixed(1) + ' Km</small>');
								infoWindow.open(mapa, marcaDestino);
							} else {
								window.alert('Directions request failed due to ' + status);
							}
						});

					}, function(){
						mensajes.alert({"mensaje": "No pudimos obtener tu ubicación, revisa tener habilitado el GPS de tu dispositivo", "titulo": "Error GPS"});
					});

					marcaOrigen = new google.maps.Marker({
						icon: "img/origen.png"
					});
					marcaOrigen.setPosition(origen);
					marcaOrigen.setMap(mapa);

					marcaDestino = new google.maps.Marker({
						icon: "img/destino.png"
					});
					marcaDestino.setPosition(destino);
					marcaDestino.setMap(mapa);

					$("#dvDetalle").show();
					$("#dvListaAdjudicadas").hide();

					$(".btnRegresar").click(function(){
						$("#dvDetalle").hide();
						$("#dvListaAdjudicadas").show();
					});

					detalle.find(".dvEnRuta").hide();
					detalle.find(".dvTerminar").hide();

					if (idOrden == undefined || idOrden == null)
						detalle.find(".dvEnRuta").show();
					else if (idOrden == datos.idOrden)
						detalle.find(".dvTerminar").show();
					else
						detalle.find(".dvEnRuta").show();



					navigator.geolocation.getCurrentPosition(function(position){
						console.log("Ok", position);
					}, function(error){
						console.log("Error", error);
					});


					cordova.plugins.backgroundMode.on('activate', function() {
						cordova.plugins.backgroundMode.disableWebViewOptimizations();
					});

					cordova.plugins.backgroundMode.setDefaults({
						title: "En ruta",
						text: "Estas en ruta en la orden " + datos.folio,
						icon: 'icon', // this will look for icon.png in platforms/android/res/drawable|mipmap
						color: "F14F4D", // hex format like 'F14F4D'
						resume: true,
						hidden: false,
						bigText: Boolean
					});


					cordova.plugins.backgroundMode.on('enable', function(){
						window.localStorage.removeItem("fecha");
						cordova.plugins.backgroundMode.disableWebViewOptimizations();
						navigator.geolocation.watchPosition(function(position){
							var idOrden = window.localStorage.getItem("idOrden");

							var fecha = window.localStorage.getItem("fecha");
							var dt = new Date();

							if (fecha == null || fecha == NaN || fecha == 'NaN')
								window.localStorage.setItem("fecha", dt.getTime());

							fecha = fecha == null || fecha == NaN || fecha == 'NaN'?(dt.getTime()):fecha;

							if (idOrden != undefined && idOrden != ''){
								var ultimoUpdate = new Date(fecha);
								if ((dt.getTime() - 60000) >= fecha){
									window.localStorage.setItem("fecha", dt.getTime());

									$.post(server + 'cordenes', {
										"orden": idOrden,
										"latitude": position.coords.latitude,
										"longitude": position.coords.longitude,
										"gps": position,
										"action": 'addPosicion',
										"movil": true
									}, function(resp){
										if (!resp.band)
											console.log("Error");
										else
											console.log("Posición reportada");
									}, "json").done(function(){
										console.log("Listo BG");
									}).fail(function(){
										console.log("Error bug");
									});
									console.log("Enviado");
								}else{
									console.log("No se envió, aun falta tiempo", dt.getTime(), ultimoUpdate.getTime(), fecha);
								}
							}else{
								cordova.plugins.backgroundMode.disable();
								console.log("Terminando seguimiento");
								window.localStorage.removeItem("fecha");
							}

						}, function(error){
							console.log("Error GPS", error);
						}, {
							enableHighAccuracy: false,
							maximumAge        : 0,
							timeout           : 1200000
						});
					});




					$(".btnEnRuta").attr("oferta", datos.idOrden).click(function(){
						setRuta($(".btnEnRuta").attr("oferta"));
						
						$.post(server + 'cordenes', {
							"orden": idOrden,
							"latitude": gpsPrincipal.coords.latitude,
							"longitude": gpsPrincipal.coords.longitude,
							"gps": gpsPrincipal,
							"action": 'addPosicion',
							"movil": true
						}, function(resp){
							if (!resp.band)
								console.log("Error");
							else
								console.log("Posición reportada");
						}, "json");
						
						
						
						callAdjudicadas();
					});

					if (datos.idEstado == 4 && datos.idOrden = idOrden)
						setRuta(datos.idOrden);

					function setRuta(orden){
						window.localStorage.removeItem("idOrden");
						window.localStorage.removeItem("fecha");
						window.localStorage.setItem("idOrden", orden);

						$.post(server + 'cordenes', {
							"orden": orden,
							"action": 'setEnRuta',
							"movil": '1'
						}, function(resp){
							if (!resp.band)
								console.log("Error");
							else
								console.log("Cambio de estado en ruta OK");
						}, "json");

						cordova.plugins.backgroundMode.enable();

						alertify.log("Estaremos reportandole tu ubicación al cliente");
					}

					function agregarFoto(imageURI){
						var img = $("<img />");

						$("#lstImg").append(img);
						img.attr("src", "data:image/jpeg;base64," + imageURI);
						img.attr("src2", imageURI);

						img.click(function(){
							var foto = $(this);
							alertify.confirm("Se eliminará la fotografía del reporte ¿seguro?", function (e) {
								if (e) {
									foto.remove();
									alertify.success("Fotografía eliminada");
								}
							});
						});
					}

					$("#btnCamara").click(function(){
						if ($("#lstImg").find("img").length < 4){
							navigator.camera.getPicture(function(imageURI){
								agregarFoto(imageURI);
							}, function(message){
								alertify.error("Ocurrio un error al obtener la imagen");
							}, {
								quality: 100,
								destinationType: Camera.DestinationType.DATA_URL,
								encodingType: Camera.EncodingType.JPEG,
								targetWidth: 800,
								targetHeight: 800,
								correctOrientation: true,
								allowEdit: false,
								saveToPhotoAlbum: true
							});
						}else{
							alertify.error("Solo se permiten 4 fotografías");
						}
					});

					$("#btnGaleria").click(function(){
						if ($("#lstImg").find("img").length < 4){
							navigator.camera.getPicture(function(imageURI){
								agregarFoto(imageURI);
							}, function(message){
								alertify.error("Ocurrio un error al obtener la imagen");
							}, {
								quality: 100,
								destinationType: Camera.DestinationType.DATA_URL,
								encodingType: Camera.EncodingType.JPEG,
								targetWidth: 800,
								targetHeight: 800,
								correctOrientation: true,
								allowEdit: false,
								sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM
							});
						}else
							alertify.error("Solo se permiten 4 fotografías");
					});


					$("#btnTerminar").attr("oferta", datos.idOrden).click(function(){
						var punto = $("#winTerminar").attr("punto");

						if ($("#txtComentario").val() == ''){
							alertify.error("Escribe un comentario");
						}else if ($("#lstImg").find("img").length < 1){
							alertify.error("Envianos una evidencia en fotografía");
						}else{
							alertify.confirm("¿Estás seguro?", function (e) {
								if (e) {
									$("#winTerminar").modal("hide");
									var fotografias = new Array;
									i = 0;
									$("#lstImg").find("img").each(function(){
										fotografias[i] = "";
										fotografias[i++] = $(this).attr("src2");
									});

									var obj = new TOrden;
									obj.terminar({
										"id": $("#btnTerminar").attr("oferta"),
										"comentario": $("#txtComentario").val(),
										"fotografias": fotografias,
										fn: {
										 	before: function(){
										 	}, after: function(resp){

											 	if (resp.band){
											 		cordova.plugins.backgroundMode.disable();
												 	window.localStorage.removeItem("latitude");
												 	window.localStorage.removeItem("longitude");
												 	window.localStorage.removeItem("idOrden");
												 	window.localStorage.removeItem("fecha");

												 	alertify.success("Muchas gracias por la información, tu trabajo fue enviado");
												 	callAdjudicadas();
											 	}else{
												 	alertify.error("Ocurrió un error, intentalo más tarde");
											 	}
											}
										}
									});
								}
							});
						}
					});

				});

				$("#dvListaAdjudicadas").append(plantilla);
			});
		}, "json");
	}
}
