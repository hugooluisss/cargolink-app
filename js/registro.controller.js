function callRegistro(){
	$("#modulo").html(plantillas["registro"]);
	setPanel();
	
	$("#frmRegistro").validate({
		debug: true,
		errorClass: "validateError",
		rules: {
			txtCorreo: {
				required: true,
				email: true,
				"remote": {
					url: server + "ctransportistas",
					type: "post",
					data: {
						"action": "validarEmail",
						"movil": "true"
					}
				}
			},
			txtTelefono: {
				required: true
			},
			txtPass: {
				required : true
			}
		},
		messages: {
			"txtCorreo": {
				"remote": "El correo ya se encuentra registrado"
			}
		},
		wrapper: 'span',
		submitHandler: function(form){
			var obj = new TUsuario;
			form = $(form);
			obj.add({
				correo: form.find("#txtCorreo").val(), 
				pass: form.find("#txtPass").val(),
				telefono: form.find("#txtTelefono").val(),
				tipoCamion: 1,
				aprobado: 0,
				fn: {
					before: function(){
						form.find("[type=submit]").prop("disabled", true);
					},
					after: function(data){
						if (data.band == false){
							mensajes.alert({
								"mensaje": "No pudimos registrar tu cuenta",
								"titulo": "Registro"
							});
							form.find("[type=submit]").prop("disabled", false);
						}else{
							mensajes.log({
								"mensaje": "Registro realizado... nosotros nos comunicaremos contigo"
							});
							callIndex();
						}
					}
				}
			});
		}
	});
}