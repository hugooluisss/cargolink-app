function callHome(){
	console.info("Llalmando a home");
	$("#modulo").html(plantillas["home"]);
	setPanel();
	console.info("Carga de home finalizada");
	
	objUsuario.getData({
		"id": objUsuario.idTransportista,
		fn: {
			after: function(resp){
				if(resp.datos.situacion == 1)
					$("#dvEnRuta").show();
			}
		}
	})
	
	
	$("#btnSalir").click(function(){
		alertify.confirm("¿Seguro?", function(e){
    		if(e) {
    			window.plugins.PushbotsPlugin.removeTags(["transporitsta"]);
    			window.plugins.PushbotsPlugin.removeAlias();
	    		window.localStorage.removeItem("session");
	    		backgroundGeolocation.stop();
	    		location.href = "index.html";
	    	}
    	});
	});
}