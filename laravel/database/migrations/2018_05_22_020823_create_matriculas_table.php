<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMatriculasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('matriculas', function ($table) {
            $table->increments('id');
            $table->unsignedInteger('alumno_id')->index();
            $table->foreign('alumno_id')->references('id')->on('alumnos')->onDelete('cascade')->onUpdate('cascade');
            $table->unsignedInteger('seccion_id')->index();
            $table->foreign('seccion_id')->references('id')->on('secciones')->onDelete('cascade')->onUpdate('cascade');
            $table->integer('year');
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
         Schema::drop('matriculas');
    }
}
