<?php

namespace App;
use Hash;

use Illuminate\Database\Eloquent\Model;

class Alumno extends Model
{
    //para poder utilizar la creacion masiva con creater
	//protected $fillable = ['rne', 'nombre', 'apellido','email','username'];

	//protected $fillable = ['rne', 'nombre', 'apellido','email','username'];
	
   public function setPasswordAttribute($password){
    	$this->attributes['password'] = Hash::make($password); //bcrypt($password);
    }

    public function asistencias()
    {
       return $this->hasMany('App\Detallesasistencia');
    }
    public function matriculas()
    {
       return $this->hasMany('App\Matricula');
    }

	
}
