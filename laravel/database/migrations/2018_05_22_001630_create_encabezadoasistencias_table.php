<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEncabezadoasistenciasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('encabezadoasistencias', function ($table) {

            $table->increments('id');
            $table->unsignedInteger('seccion_id')->index();
            $table->foreign('seccion_id')->references('id')->on('secciones')->onDelete('cascade')->onUpdate('cascade');
            $table->unsignedInteger('asignatura_id')->index();
            $table->foreign('asignatura_id')->references('id')->on('asignaturas')->onDelete('cascade')->onUpdate('cascade');
            $table->date('fecha');
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
        Schema::dropIfExists('encabezadoasistencias');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
