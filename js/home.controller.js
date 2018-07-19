function callHome(){
	console.info("Llalmando a home");
	$("#modulo").html(plantillas["home"]);
	setPanel();
	console.info("Carga de home finalizada");
}