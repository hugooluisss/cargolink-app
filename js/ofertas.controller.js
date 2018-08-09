function callOfertas(){
	console.info("Llamando a ofertas");
	$("#modulo").html(plantillas["ofertas"]);
	setPanel();
	var mapa = undefined;
	
	mensajes.log({"mensaje": "Estamos obteniendo tu ubicación"});
	navigator.geolocation.getCurrentPosition(getLista, function(){
		mensajes.alert({"mensaje": "No pudimos obtener tu ubicación, revisa tener habilitado el GPS de tu dispositivo", "titulo": "Error GPS"});
		callPanel("home");
	});
	
	
	function getLista(gps){
		$.post(server + "listaordenestransportistas", {
			movil: true,
			transportista: objUsuario.idTransportista,
			posicion: gps
		}, function(ordenes){
			$("#dvLista").html("");
			
			if (ordenes.length == 0){
				$("#dvLista").html(plantillas['sinOfertas']);
			}
			
			
			$.each(ordenes, function(i, orden){
				var plantilla = $(plantillas['oferta']);
				setDatos(plantilla, orden);
				plantilla.attr("json", JSON.stringify(orden));
				plantilla.find(".ver").click(function(){
					var detalle = $(plantillas['detalleOferta']);
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
					$("#dvLista").hide();
					
					$(".btnRegresar").click(function(){
						$("#dvDetalle").hide();
						$("#dvLista").show();
					});
					
					$(".btnPostular").click(function(){
						var btn = $(this);
						mensajes.prompt({
							"mensaje": "Tu presupuesto",
							"titulo": "Postular",
							"botones": [
								"Postular", "Cancelar"
							],
							"funcion": function(result){
								if (result.buttonIndex == 1){
									monto = result.input1;
									if (Number(monto) <= Number(datos.presupuesto) && Number(monto) > 0){
										var oferta = $(this).attr("oferta");
							    		var obj = new TOrden;
							    		obj.aceptar({
							    			"id": objUsuario.idTransportista,
							    			"oferta": datos.idOrden,
							    			"monto": monto,
							    			fn: {
												before: function(){
													btn.prop("disabled", true);
												}, after: function(resp){
													btn.prop("disabled", false);
				
													if (resp.band){
													 	callPanel("home");
													 	
													 	alertify.success("Muchas gracias por tu interes, te mantendremos informado de la adjudicación de la orden de trabajo");
												 	}else{
												 		alertify.error("La propuesta no fue aceptada, intentalo más tarde");
													}
												}
											}
										});
									}else
										mensajes.alert({"mensaje": "Debes de indicar tu presupuesto", "titulo": "presupuesto"})
								}
							}
						});
					});
				});
				$("#dvLista").append(plantilla);
			});
		}, "json");
	}
}