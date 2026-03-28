<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSeccionesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {

         //
        Schema::create('secciones', function ($table) {

            $table->increments('id');
            $table->unsignedInteger('modalidad_id')->index();
            $table->foreign('modalidad_id')->references('id')->on('modalidades')->onDelete('cascade')->onUpdate('cascade');
            $table->string('curso');
            $table->string('seccion',1);
            $table->string('jornada');
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
         DB::statement('SET FOREIGN_KEY_CHECKS = 0');
         Schema::dropIfExists('secciones');
         DB::statement('SET FOREIGN_KEY_CHECKS = 1');
       
    }
}
