<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class PeriodoTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('periodos', function ($table) {
            $table->increments('id');
            $table->date('fecha_inicio');
            $table->date('fecha_final');
            $table->string('observaciones',300);
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
        Schema::dropIfExists('periodos');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
