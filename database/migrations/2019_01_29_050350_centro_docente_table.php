<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CentroDocenteTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('centro_docente', function ($table) {

            $table->increments('id');
            $table->unsignedInteger('docente_id')->index();
            $table->foreign('docente_id')->references('id')->on('docentes')->onUpdate('cascade');
            $table->unsignedInteger('centro_id')->index();
            $table->foreign('centro_id')->references('id')->on('centros')->onUpdate('cascade');
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
        Schema::dropIfExists('centro_docente');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
