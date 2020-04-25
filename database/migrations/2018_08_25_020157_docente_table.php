<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class DocenteTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('docentes', function ($table) {
            $table->increments('id');
            $table->string('username');
            $table->string('nombre');
            $table->string('apellido');
            $table->integer('genero');
            $table->string('direccion');
            $table->string('user_sace');
            $table->string('password_sace');
            $table->string('email')->unique();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');
        Schema::dropIfExists('docentes');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
