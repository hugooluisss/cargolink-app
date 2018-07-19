function callLogin(){
	$("#modulo").html(plantillas["login"]);
	setPanel();
	
	$("#lnkLostPass").click(function(){
		$("#winInicioSesion").modal("hide");
		alertify.prompt("<b>¿Olvidaste tu contraseña?</b>, introduce tu correo electrónico:", function (e, str) { 
			if (e){
				if (str == '')
					alertify.error("No se indicó un correo electrónico");
				else{
					var chofer = new TChofer;
					
					chofer.recuperarPass(str, {
						before: function(){
							$("#lnkLostPass").prop("disabled", true);
							alertify.success("Gracias, enviaremos un correo a <b>" + str + "</b> para la recuperación de tu contraseña");
						},
						afert: function(resp){
							$("#lnkLostPass").prop("disabled", false);
						}
					});
				}
					
			}else
				$("#winInicioSesion").modal();
		}, $("#frmLogin").find("#txtUsuario").val());
	});
	
	$("#frmLogin").find("#txtUsuario").focus();
	$("#frmLogin").validate({
		debug: true,
		errorClass: "validateError",
		rules: {
			txtUsuario: {
				required : true,
				email: true
			},
			txtPass: {
				required : true
			}
		},
		wrapper: 'span',
		submitHandler: function(form){
			var obj = new TUsuario;
			
			obj.login({
				usuario: $("#txtUsuario").val(), 
				pass: $("#txtPass").val(),
				fn: {
					before: function(){
						$("#frmLogin [type=submit]").prop("disabled", true);
					},
					after: function(data){
						if (data.band == false){
							mensajes.alert({
								"mensaje": "Tus datos no son válidos",
								"titulo": "Inicio de sesión"
							});
							$("#frmLogin [type=submit]").prop("disabled", false);
						}else{
							window.localStorage.removeItem("session");
							window.localStorage.setItem("session", data.datos.idTransportista);
							
							location.href = "inicio.html";
						}
					}
				}
			});
		}
	});
}