<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddIdMovilToEncabezadoAsistencia extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::table('encabezadoasistencias', function (Blueprint $table) {
            $table->unsignedInteger('movil_id')->index()->after("fecha")->nullable()->default('0');  
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
        //
        //
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');
        Schema::table('encabezadoasistencias', function (Blueprint $table) {
             $table->dropColumn('movil_id');
            //
        });
         DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
