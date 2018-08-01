TOrden = function(fn){
	var self = this;
	
	this.aceptar = function(datos){
		if (datos.fn.before !== undefined) datos.fn.before();
		
		$.post(server + 'cordenes', {
				"transportista": datos.id,
				"orden": datos.oferta,
				"monto": datos.monto,
				"action": 'adjudicar',
				"movil": true
			}, function(resp){
				if (resp.band == false)
					console.log("No se pudo asignar");
					
				if (datos.fn.after !== undefined)
					datos.fn.after(resp);
			}, "json");
	}
	
	this.asignarChofer = function(datos){
		if (datos.fn.before !== undefined) datos.fn.before();
		
		$.post(server + 'cordenes', {
				"chofer": datos.conductor,
				"orden": datos.orden,
				"patenteRampla": datos.patenteRampla,
				"patenteCamion": datos.patenteCamion,
				"action": 'asignarChofer',
				"movil": '1'
			}, function(resp){
				if (resp.band == false)
					console.log("No se pudo asignar");
					
				if (datos.fn.after !== undefined)
					datos.fn.after(resp);
			}, "json");
	}
	
	this.sendPosicion = function(datos){
		if (datos.fn.before !== undefined) datos.fn.before();
		
		$.post(server + 'cordenes', {
				"orden": datos.id,
				"latitude": datos.latitude,
				"logitude": datos.longitude,
				"action": 'logPosicion',
				"movil": '1'
			}, function(resp){
				if (resp.band == false)
					console.log(resp.mensaje);
					
				if (datos.fn.after !== undefined)
					datos.fn.after(resp);
			}, "json");
	}
	
	this.terminar = function(datos){
		if (datos.fn.before !== undefined) datos.fn.before();
		
		$.post(server + 'cordenes', {
				"orden": datos.id,
				"comentario": datos.comentario,
				"foto1": datos.fotografias[0],
				"foto2": datos.fotografias[1],
				"foto3": datos.fotografias[2],
				"foto4": datos.fotografias[3],
				"action": 'terminar',
				"movil": '1'
			}, function(resp){
				if (resp.band == false)
					console.log(resp.mensaje);
					
				if (datos.fn.after !== undefined)
					datos.fn.after(resp);
			}, "json");
	}
};