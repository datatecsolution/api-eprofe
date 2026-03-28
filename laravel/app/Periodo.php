<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Periodo extends Model
{
    //

     public function secciones(){
        return $this->hasMany('App\Seccion');
    }
}
