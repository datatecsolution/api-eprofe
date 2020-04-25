<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::group(['prefix'=>'v1','middlew are'=>'cors'],function(){


	Route::get('asignaturas/buscar_asignaturas_seccion','AsignaturaController@buscar_por_seccion');
	Route::get('asignaturas/docente','AsignaturaController@docente_asignaturas');
	Route::resource('asignaturas', 'AsignaturaController');


	Route::resource('images', 'ImagesController');

	Route::get('asistencias/docente', 'AsistenciaController@docente');
	Route::resource('asistencias', 'AsistenciaController');

	Route::get('secciones/docente','SeccionController@docente_secciones');
	Route::put('secciones/update_periodo','SeccionController@update_periodo');
	Route::resource('secciones' ,'SeccionController');

	Route::resource('alumnos' ,'AlumnoController');

	Route::resource('modalidades' ,'ModalidadesController');

	Route::get('matriculas/buscar_seccion_year','MatriculaController@buscar_por_year');
	Route::resource('matriculas','MatriculaController');

	Route::resource('detallesasistencia','AsistenciaDetalleController');

	Route::get('acumulativos/docente','AcumulativoController@docente');
	Route::get('acumulativos/seccion_parcial','AcumulativoController@seccion_parcial');
	Route::get('acumulativos/docente_seccion','AcumulativoController@docente_seccion');
	Route::resource('acumulativos','AcumulativoController');
	
	Route::get('notaacumulativos/buscar_asignatura','NotaAcumulativoController@buscar_asignatura');
	Route::put('notaacumulativos/actualizar_notas','NotaAcumulativoController@actualizar');
	Route::resource('notaacumulativos','NotaAcumulativoController');

	Route::resource('tipoacumlativos','TipoAcumulativoController');

	Route::resource('docentes','DocenteController');

	Route::resource('centros','CentroController');
	Route::resource('periodos','PeriodoController');

	Route::get('usersace/sicronizar','SaceUserController@sicronizar');
	Route::resource('usersace','SaceUserController');
	
});
