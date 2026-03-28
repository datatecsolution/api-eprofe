<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CentroTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('centros', function ($table) {
            $table->increments('id');
            $table->string('nombre',250);
            $table->string('codigo_sace',20)->unique();
            $table->string('direccion',250);
            $table->string('telefono',150);
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
        Schema::dropIfExists('centros');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
