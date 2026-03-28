<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Detallesasistencia extends Model
{
    //
    public function encabezadoAsistencia()
    {
        return $this->belongsTo('App\Encabezadoasistencia','encabezadoasistencia_id','id');
    }
    public function alumno()
    {
        return $this->belongsTo('App\Alumno');
    }
}
