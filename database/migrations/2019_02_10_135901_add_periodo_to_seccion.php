<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddPeriodoToSeccion extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('seccions', function (Blueprint $table) {
            //
            $table->integer('periodo_id')->after("centro_id");
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
        Schema::table('seccions', function (Blueprint $table) {
            //
            $table->dropColumn('periodo_id');
        });
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
