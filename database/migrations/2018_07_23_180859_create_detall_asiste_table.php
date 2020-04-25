<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDetallAsisteTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
         Schema::create('detallesasistencias', function ($table) {

            $table->increments('id');
            $table->unsignedInteger('alumno_id')->index();
            $table->foreign('alumno_id')->references('id')->on('alumnos')->onDelete('cascade')->onUpdate('cascade');
            $table->unsignedInteger('encabezadoasistencia_id')->index();
             $table->foreign('encabezadoasistencia_id')->references('id')->on('encabezadoasistencias')->onDelete('cascade')->onUpdate('cascade');
            $table->boolean('estado');
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
        Schema::dropIfExists('detallesasistencias');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
