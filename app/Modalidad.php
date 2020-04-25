<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Modalidad extends Model
{
	protected $table="modalidades";
    protected $primaryKey = 'id';
    
   public function secciones()
    {
        return $this->hasMany('App\Seccion');
    }
    public function centros(){

    	return $this->belongsToMany('App\Centro', 'centros_modalidades', 'centro_id', 'modalidad_id');
  
    }
}
