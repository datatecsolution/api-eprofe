<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Tipoacumulativo extends Model
{
    //
    public function acumulativos()
    {
        return $this->hasMany('App\Acumulativo');
    }
}
