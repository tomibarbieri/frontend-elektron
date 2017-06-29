//Web Socket Communication with Python Server for data retrieval (PyMongo and Tornado Web Socket)

var mota_id = 0;
var aula = 0;
var temp = 0;
var hume = 0;
var estado = 0;
var consumo = 0;
var hora = 0;
//Web Socket comunication
//Connect to server
var ws = new WebSocket("ws://localhost:8888/websocket");
//console.log(ws);
//Open the socket and say hi
ws.onopen = function() {
    ws.send("Hello, world");
};
//Receive message form server
ws.onmessage = function (evt) {
    json = JSON.parse(evt.data);
    //console.log(json);
    //set the variables of the object to global variables
    
    mota_id = json.mota_id;
    aula = json.aula;
    temp = json.temperatura;
    hume = json.humedad;
    estado = json.estado;
    consumo = json.consumo;
    hora = json.hora;
    
    var date = new Date(timestamp*1000);
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = date.getMinutes();
    // Seconds part from the timestamp
    var seconds = date.getSeconds();
    // Format Time
    time=hours + ":" + minutes + ":" + seconds;
};
