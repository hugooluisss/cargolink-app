TUsuario = function(chofer){
	var self = this;
	self.idTransportista = window.localStorage.getItem("session");
	self.datos = {};
	
	this.isLogin = function(){
		if (self.idTransportista == '' || self.idTransportista == undefined || self.idTransportista == null) return false;
		if (self.idTransportista != window.localStorage.getItem("session")) return false;
		
		return true;
	};
	
	this.login = function(datos){
		if (datos.fn.before !== undefined) datos.fn.before();
		
		$.post(server + 'clogin', {
			"usuario": datos.usuario,
			"pass": datos.pass, 
			"action": 'logintransportista',
			"movil": 'true'
		}, function(resp){
			if (resp.band == false)
				console.log(resp.mensaje);
			else{
				window.localStorage.setItem("session", resp.datos.usuario);
				self.idTransportista = resp.datos.idTransportista;
			}
				
			if (datos.fn.after !== undefined)
				datos.fn.after(resp);
		}, "json");
	};
	
	this.getData = function(datos){
		if (datos.fn.before !== undefined) datos.fn.before();
		
		var usuario = datos.idTransportista == undefined?self.idTransportista:datos.idTransportista;
		
		$.post(server + 'cusuarios', {
			"id": usuario,
			"action": 'getData',
			"movil": 'true'
		}, function(resp){
			self.datos = resp;
			self.imagenPerfil = self.datos.imagenPerfil;
			if (datos.fn.after !== undefined)
				datos.fn.after(resp);
		}, "json");
	}
	
	this.recuperarPass = function(correo, fn){
		if (fn.before !== undefined) fn.before();
		
		$.post(server + 'cusuarios', {
				"correo": correo,
				"action": 'recuperarPass',
				"movil": '1'
			}, function(data){
				if (data.band == false)
					console.log(data.mensaje);
					
				if (fn.after !== undefined)
					fn.after(data);
			}, "json");
	};
	
	this.add = function(datos){
		if (datos.fn.before !== undefined) datos.fn.before();
		
		$.post(server + 'ctransportistas', {
				"id": datos.id,
				"razonSocial": datos.razonSocial,
				"tipoCamion": datos.tipoCamion,
				"representante": datos.email, 
				"rut": datos.rut,
				"patente": datos.patente,
				"correo": datos.correo,
				"pass": datos.pass,
				"calificacion": datos.calificacion,
				"aprobado": datos.aprobado,
				"situacion": datos.situacion,
				"action": "add",
				"movil": true
			}, function(data){
				if (data.band == false)
					console.log("No se guardó el registro");
					
				if (datos.fn.after !== undefined)
					datos.fn.after(data);
			}, "json");
	};
};