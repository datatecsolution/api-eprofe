<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Acumulativo extends Model
{
    //
    public function tipoAcumulativo()
    {
        return $this->belongsTo('App\Tipoacumulativo');
    }
    public function notasAcumulativos()
    {
        return $this->hasMany('App\Notaacumulativo');
    }
    public function asignatura()
    {
        return $this->belongsTo('App\Asignatura');
    }
    public function seccion()
    {
        return $this->belongsTo('App\Seccion');
    }
}
