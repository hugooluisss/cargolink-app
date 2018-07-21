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
				
				plantilla.find(".ver").click(function(){
					var detalle = $(plantillas['detalleOfertaPostulada']);
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