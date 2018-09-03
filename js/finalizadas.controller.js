function callFinalizadas(){
	console.info("Llamando a ofertas finalizadas");
	$("#modulo").html(plantillas["finalizadas"]);
	setPanel();
	getLista();
	var mapa = undefined;
	
	function getLista(){
		$.post(server + "listaordenestransportistasfinalizadas", {
			movil: true,
			transportista: objUsuario.idTransportista,
		}, function(ordenes){
			$("#dvListaFinalizadas").html("");
			
			if (ordenes.length == 0){
				$("#dvListaFinalizadas").html(plantillas['sinOfertas']);
			}
			
			$.each(ordenes, function(i, orden){
				var plantilla = $(plantillas['ofertaFinalizada']);
				setDatos(plantilla, orden);
				plantilla.attr("json", JSON.stringify(orden));
				
				plantilla.find(".ver").click(function(){
					var detalle = $(plantillas['detalleOfertaFinalizada']);
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
					$("#dvListaFinalizadas").hide();
					
					$(".btnRegresar").click(function(){
						$("#dvDetalle").hide();
						$("#dvListaFinalizadas").show();
					});
				});
				
				$("#dvListaFinalizadas").append(plantilla);
			});
		}, "json");
	}
}