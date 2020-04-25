<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Encabezadoasistencia extends Model
{
    //
    public function detallesAsistencia()
    {
        return $this->hasMany('App\Detallesasistencia');
    }
    public function seccion()
    {
        return $this->belongsTo('App\Seccion');
    }
    public function asignatura()
    {
        return $this->belongsTo('App\Asignatura');
    }
}
