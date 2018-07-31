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
					
					if (mapa == undefined){
						mapa = new google.maps.Map(document.getElementById("mapa"), {
							center: {lat: datos.origen_json.latitude, lng: datos.origen_json.longitude},
							scrollwheel: true,
							fullscreenControl: true,
							zoom: 10,
							zoomControl: true
						});
					}
					
					var origen = new google.maps.LatLng(datos.origen_json.latitude, datos.origen_json.longitude);
					var destino = new google.maps.LatLng(datos.destino_json.latitude, datos.destino_json.longitude);
					
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
					
					$("#dvDetalle").show();
					$("#dvListaAdjudicadas").hide();
					
					$(".btnRegresar").click(function(){
						$("#dvDetalle").hide();
						$("#dvListaAdjudicadas").show();
					});
					
					var idOrden = window.localStorage.getItem("idOrden");
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
							
							fecha = fecha == null || fecha == NaN || fecha == 'NaN'?(dt.getTime()):fecha;
							
							if (idOrden != undefined && idOrden != ''){
								var ultimoUpdate = new Date(fecha);
								if (dt.getTime() - (60000) >= fecha){
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
						callAdjudicadas();
					});
					
					if (datos.idEstado == 4)
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
					
					$("#btnTerminar").attr("oferta", datos.idOrden).click(function(){
						var punto = $("#winTerminar").attr("punto");

						if ($("#txtComentario").val() == ''){
							alertify.error("Escribe un comentario");
						}else if ($("#lstImg").find("img").length < 1){
							alertify.error("Envianos una evidencia en fotografía");
						}else{
							alertify.confirm("¿Estás seguro?", function (e) {
								if (e) {
									var fotografias = new Array;
									i = 0;
									$("#lstImg").find("img").each(function(){
										fotografias[i] = "";
										fotografias[i++] = $(this).attr("src2");
									});
									
									var obj = new TOferta;
									obj.terminar({
										"punto": punto,
										"comentario": $("#txtComentario").val(),
										"fotografias": fotografias,
										fn: {
										 	before: function(){
											 	jsShowWindowLoad("Estamos indicando que el servicio se ha completado, por favor espera");
										 	}, after: function(resp){
										 		if (resp.faltantes == 0){
												 	cordova.plugins.backgroundMode.disable();
												 	window.localStorage.removeItem("latitude");
												 	window.localStorage.removeItem("longitude");
												 	window.localStorage.removeItem("idOrden");
												 	alertify.success("El reporte de tu ubicación ha finalizado");
												}else{
													alertify.success("Gracias, puedes continuar tu recorrido");
												}
											 	
											 	$("#winTerminar").modal("hide");
											 	
											 	if (resp.band){
												 	callAdjudicadas();
												 	alertify.success("Muchas gracias por la información, tu trabajo fue enviado");
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