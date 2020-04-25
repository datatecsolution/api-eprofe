<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddTelefonoToDocente extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('docentes', function (Blueprint $table) {
            //
            $table->string('telefono',150)->after("email");
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
        Schema::table('docentes', function (Blueprint $table) {
            //
             $table->dropColumn('telefono');
        });
         DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
