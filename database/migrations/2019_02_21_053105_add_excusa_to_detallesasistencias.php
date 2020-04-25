<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddExcusaToDetallesasistencias extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('detallesasistencias', function (Blueprint $table) {

            $table->boolean('excusa')->after("estado");   
            //
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
        Schema::table('detallesasistencias', function (Blueprint $table) {
             $table->dropColumn('excusa');
            //
        });
         DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
