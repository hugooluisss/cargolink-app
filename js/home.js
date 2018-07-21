/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var objUsuario = null;
var plantillas = {};
var app = {
	// Application Constructor
	initialize: function() {
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicitly call 'app.receivedEvent(...);'
	onDeviceReady: function() {
		window.plugins.PushbotsPlugin.initialize("591c5d2d4a9efa6e888b4567", {
			"android":{
				"sender_id":"298644715501"
			}
		});
		
		// Should be called once app receive the notification only while the application is open or in background
		window.plugins.PushbotsPlugin.on("notification:received", function(data){
			console.log("received:", data);
			var datos = JSON.stringify(data);
			window.plugins.PushbotsPlugin.resetBadge();
			
			//Silent notifications Only [iOS only]
			//Send CompletionHandler signal with PushBots notification Id
			window.plugins.PushbotsPlugin.done(data.pb_n_id);
			if (data.aps.alert != '')
				alertify.success(data.aps.alert);
				
			window.plugins.PushbotsPlugin.resetBadge();
		});
		
		// Should be called once the notification is clicked
		window.plugins.PushbotsPlugin.on("notification:clicked", function(data){
			console.log("clicked:" + JSON.stringify(data));
			if (data.message != undefined)
				alertify.success(data.message);
				
			window.plugins.PushbotsPlugin.resetBadge();
		});
	}
};

app.initialize();

$(document).ready(function(){
	objUsuario = new TUsuario;
	if (!objUsuario.isLogin())
		location.href = "index.html";
		
	
	plantillas["home"] = "";
	plantillas["ofertas"] = "";
	plantillas["oferta"] = "";
	plantillas["detalleOferta"] = "";
	plantillas["sinOfertas"] = "";
	plantillas["postuladas"] = "";
	plantillas["detalleOfertaPostulada"] = "";
	plantillas["adjudicadas"] = "";
	plantillas["detalleOfertaAdjudicada"] = "";
	
	getPlantillas(function(){
		callHome();
	});
	
	//app.onDeviceReady();
});

function callPanel(panel){
	switch(panel){
		case 'home':
			callHome();
		break;
		case 'ofertas':
			callOfertas();
		break;
		case 'postuladas':
			callPostuladas();
		break;
		case 'adjudicadas':
			callAdjudicadas();
		break;
		default:
			console.info("Panel no encontrado");
	}
}