<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDetallAcumulTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('notaacumulativos', function ($table) {

            $table->increments('id');

            $table->unsignedInteger('alumno_id')->index();
            $table->foreign('alumno_id')->references('id')->on('alumnos')->onDelete('cascade')->onUpdate('cascade');

            $table->unsignedInteger('acumulativo_id')->index();
            $table->foreign('acumulativo_id')->references('id')->on('acumulativos')->onDelete('cascade')->onUpdate('cascade');
            
            $table->double('nota');
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
        Schema::dropIfExists('notaacumulativos');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }

}
