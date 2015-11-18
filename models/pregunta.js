var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var	schemaPregunta   = new Schema({
	pregunta: String,
	idRespuesta: [{ type: Schema.Types.ObjectId, ref: 'Respuesta' }]
});

module.exports = mongoose.model('Pregunta', schemaPregunta);
