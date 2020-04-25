<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Centro extends Model
{
    //
    public function docentes()
    {
       return $this->belongsToMany('App\Docente', 'centro_docente', 'docente_id', 'centro_id');
    }
    public function modalidades()
    {
       return $this->belongsToMany('App\Modalidad', 'centros_modalidades', 'modalidad_id', 'centro_id');
    }
    public function secciones(){
        return $this->hasMany('App\Seccion');
    }
}
