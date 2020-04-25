<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Docente extends Model
{
    //
    public function asignaturas(){

    	return $this->belongsToMany('App\Asignatura', 'asignaturas_secciones', 'docente_id', 'asignatura_id');
  
    }
    public function centros(){

    	return $this->belongsToMany('App\Centro', 'centro_docente', 'centro_id', 'docente_id');
  
    }
}
