<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Notaacumulativo extends Model
{
    //
    public function acumulativo()
    {
        return $this->belongsTo('App\Acumulativo');
    }
    public function alumno()
    {
        return $this->belongsTo('App\Alumno');
    }

}
