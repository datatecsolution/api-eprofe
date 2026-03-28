<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CentroModalidaTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('centros_modalidades', function ($table) {
            $table->increments('id');
            $table->integer('centro_id')->index()->unsigned();
            $table->foreign('centro_id')->references('id')->on('centros')->onUpdate('cascade')->onDelete('cascade');
            $table->integer('modalidad_id')->index()->unsigned();
            $table->foreign('modalidad_id')->references('id')->on('modalidades')->onUpdate('cascade')->onDelete('cascade');
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
        Schema::dropIfExists('centros_modalidades');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
