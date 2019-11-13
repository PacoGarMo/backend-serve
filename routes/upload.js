var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

// Models
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// default options
app.use(fileUpload());

// Rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de collection
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Collection no valida',
            errors: { message: 'Collection no valida' }
        });
    }

    if (!req.files) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Error subiendo archivo',
            errors: { message: 'Debe de seleccionar una imagen' }
        });

    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo estas extension correctas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'las extensiones validad son ' + extensionesValidas.join(', ') }
        });

    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover archivo del temp a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subitPorTipo(tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        //     extensionArchivo: extensionArchivo
        // });

    })

});


function subitPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Id del usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe elimina imagen anterior
            if (fs.existsSync(pathViejo)) {
                /*
                El metodo unlink pasa a ser assyncrona, por lo que necesita una funcion callback
                de ahi el error ERR_INVALID_CALLBACK al llamarla sin 2º parametro,
                se le añade una funcion para mostrar un log y ya funciona correctamente.
                !!!! Se puede usar el metodo fs.unlinkSync para evitar este error !!!!
                */
                fs.unlink(pathViejo, function() { console.log('Deleted image') });
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.passqord = 'xD';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });

            });

        });

    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Id del medico no existe',
                    errors: { message: 'Medico no existe' }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // Si existe elimina imagen anterior
            if (fs.existsSync(pathViejo)) {
                /*
                El metodo unlink pasa a ser assyncrona, por lo que necesita una funcion callback
                de ahi el error ERR_INVALID_CALLBACK al llamarla sin 2º parametro,
                se le añade una funcion para mostrar un log y ya funciona correctamente.
                !!!! Se puede usar el metodo fs.unlinkSync para evitar este error !!!!
                */
                fs.unlink(pathViejo, function() { console.log('Deleted image') });
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });

            });

        });

    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Id del hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe elimina imagen anterior
            if (fs.existsSync(pathViejo)) {
                /*
                El metodo unlink pasa a ser assyncrona, por lo que necesita una funcion callback
                de ahi el error ERR_INVALID_CALLBACK al llamarla sin 2º parametro,
                se le añade una funcion para mostrar un log y ya funciona correctamente.
                !!!! Se puede usar el metodo fs.unlinkSync para evitar este error !!!!
                */
                fs.unlink(pathViejo, function() { console.log('Deleted image') });
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });

            });

        });

    }

}


module.exports = app;