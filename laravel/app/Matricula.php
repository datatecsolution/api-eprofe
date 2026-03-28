<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Matricula extends Model
{
    //
    public function alumno()
    {
        return $this->belongsTo('App\Alumno');
    }
    public function seccion()
    {
       return $this->belongsTo('App\Seccion');
    }
}
