var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var	schemaRespuesta   = new Schema({
	respuesta: String,
	idPregunta: { type : Schema.Types.ObjectId, ref: 'Pregunta' }
});

module.exports = mongoose.model('Respuesta', schemaRespuesta);
