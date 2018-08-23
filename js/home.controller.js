function callHome(){
	console.info("Llalmando a home");
	$("#modulo").html(plantillas["home"]);
	setPanel();
	console.info("Carga de home finalizada");
	
	$("#btnSalir").click(function(){
		alertify.confirm("¿Seguro?", function(e){
    		if(e) {
    			window.plugins.PushbotsPlugin.removeTags(["chofer", "operador"]);
    			window.plugins.PushbotsPlugin.removeAlias();
	    		window.localStorage.removeItem("sesion");
	    		window.localStorage.removeItem("idOrden");
	    		//backgroundGeolocation.stop();
	    		location.href = "index.html";
	    	}
    	});
	});
}