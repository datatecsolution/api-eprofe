<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Asignatura extends Model
{
	//protected $table="asignaturas";
    //protected $primaryKey = 'id';
    //
	public function seccions()
    {
        //return $this->belongsToMany('App\Seccion');
        return $this->belongsToMany('App\Seccion', 'asignaturas_secciones', 'asignatura_id', 'seccion_id');
    }
    public function docentes(){
    	return $this->belongsToMany('App\Docente', 'asignaturas_secciones', 'asignatura_id', 'docente_id');
    }
}
