function callPostuladas(){
	console.info("Llamando a ofertas postuladas");
	$("#modulo").html(plantillas["postuladas"]);
	setPanel();
	getLista();
	
	function getLista(){
		$.post(server + "listaordenestransportistaspostuladas", {
			movil: true,
			transportista: objUsuario.idTransportista,
		}, function(ordenes){
			$("#dvLista").html("");
			
			if (ordenes.length == 0){
				$("#dvLista").html(plantillas['sinOfertas']);
			}
			
			$.each(ordenes, function(i, orden){
				var plantilla = $(plantillas['oferta']);
				setDatos(plantilla, orden);
				plantilla.attr("json", JSON.stringify(orden));
				$("#dvLista").append(plantilla);
			});
		}, "json");
	}
}