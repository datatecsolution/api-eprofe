<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Seccion extends Model
{
	//protected $table="secciones";
    //protected $primaryKey = 'id';
    
    public function modalidad()
    {
        return $this->belongsTo('App\Modalidad');
    }
	public function asignaturas()
    {
        return $this->belongsToMany('App\Asignatura', 'asignaturas_secciones', 'seccion_id','asignatura_id');
    }
    public function asistencias()
    {
        return $this->hasMany('App\Encabezadoasistencia');
    }
    public function matriculas()
    {
       return $this->hasMany('App\Matricula');
    }
    public function acumulativos(){
        return $this->hasMany('App\Acumulativo');
    }
    public function periodo()
    {
        return $this->belongsTo('App\Periodo');
    }
    public function centro()
    {
        return $this->belongsTo('App\Centro');
    }
}
