var socket = io.connect('http://192.168.0.7:3000');

function animateScroll(){
  var container = $('#containerMessages');
  container.animate({"scrollTop": $('#containerMessages')[0].scrollHeight}, "slow");
}

function myFunction() {
  socket.emit("loginUser", user);
}

function enviaRespuesta(idPregunta){
  var respuesta = $('input[name=optradio]:checked', "#"+idPregunta+"Algo");
  socket.emit("respondePregunta", {idPregunta: idPregunta, respuesta: respuesta.val()});
  $("#"+idPregunta+"Div").remove();
}

socket.on('updateUserList', function (data) {
  $("#chatUsers").html("");
  for (var usuario in data)
    $("#chatUsers").append("<p class='col-md-12 alert-info'>" + usuario + "</p>");
});

socket.on("updateChat", function(action, message){
  if(action == "conectado")
    $("#chatMsgs").append("<p class='col-md-12 alert-info'>" + message + "</p>");
  else if(action == "desconectado")
    $("#chatMsgs").append("<p class='col-md-12 alert-danger'>" + message + "</p>");
  else if(action == "msg")
    $("#chatMsgs").append("<p class='col-md-12 alert-warning'>" + message + "</p>");
  else if(action == "yo")
    $("#chatMsgs").append("<p class='col-md-12 alert-success'>" + message + "</p>");
  else if(action == "pregunta"){
    $("#chatMsgs").append("<div class='col-md-12 alert-success' id="+message.idPregunta+"Div><form id="+message.idPregunta+"Algo>"+message.pregunta+"<div id="+message.idPregunta+"></div><p><button type='button' class='btn' onclick='enviaRespuesta("+'"'+message.idPregunta+'"'+")'> Responder </button></p></form></div>");
    $("#questions").append("<div class='col-md-12 alert-success'>"+message.pregunta+"</p><ul class='list-group' id="+message.idPregunta+"preguntas></ul></div>");

    for (var i=0; i<message.respuestas.length; i++){
      var obj = message.respuestas[i];
      $("#"+message.idPregunta).append("<div class='radio'><label><input type='radio' name='optradio' value="+obj.respuesta+">"+obj.respuesta+"</label></div>");
      $("#"+message.idPregunta+"preguntas").append("<li class='list-group-item' id="+obj.respuesta+"> <span class='badge'>0</span>"+obj.respuesta+"</li>");
    }
  }else if(action == "respuesta"){
    var listaRespuestas = $("#"+message.idPregunta+"preguntas").children();
    $.each(listaRespuestas, function(index, val){
      if($(this).attr('id')==message.respuesta){
        var cont = parseInt($(this).find('.badge').text(),10) + 1;
        $(this).find('.badge').text(cont.toString());
      }
    });
  }
  animateScroll();
});

$('.sendMsg').on("click", function() {
  var message = $(".message").val();
  socket.emit("message", message);
  $(".message").val("");
  animateScroll();
});

$('.makeQuestion').on("click", function() {
  $("#myModal").modal();
});

$('#surveyForm').on('click', '.addButton', function() {
  var $template = $('#optionTemplate'),
    $clone    = $template
    .clone()
    .removeClass('hide')
    .removeAttr('id')
    //.attr('data-validation', 'length');
    //.attr('data-validation-length', 'min2');
    .insertBefore($template),
    $option   = $clone.find('[name="respuestas[]"]');
});

$('#surveyForm').on('click', '.removeButton', function() {
  var $row    = $(this).parents('.form-group'),
  $option = $row.find('[name="respuestas[]"]');
  // Remove element containing the option
  $row.remove();
});

function submitForm() {
  var inputs = document.getElementsByClassName( 'respuestasC' );
  var respuestas  = [].map.call(inputs, function( input ) {
    return input.value;
  });
  var pregunta =  $('#pregunta').val();
  //alert(respuestas[0])
  socket.emit("publishQuestion", {
    pregunta: pregunta,
    respuestas: respuestas
  });
  //alert(pregunta);
  //alert(arr[0].value);
  $( '#surveyForm' ).each(function(){
    this.reset();
  });
  $('#myModal').modal('hide');
  return false;
}
