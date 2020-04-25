<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAcumulTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
     public function up()
    {
        //
        Schema::create('acumulativos', function ($table) {
            $table->increments('id');
            $table->unsignedInteger('seccion_id')->index();
            $table->foreign('seccion_id')->references('id')->on('secciones')->onDelete('cascade')->onUpdate('cascade');
            $table->string('descripcion');
            $table->unsignedInteger('tipo_acumulativo_id')->index();
            $table->foreign('tipo_acumulativo_id')->references('id')->on('tipoacumulativos')->onDelete('cascade')->onUpdate('cascade');
            $table->date('fecha');
            $table->double('valor');
            $table->unsignedInteger('asignatura_id')->index();
            $table->foreign('asignatura_id')->references('id')->on('asignaturas')->onDelete('cascade')->onUpdate('cascade');
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
        Schema::dropIfExists('acumulativos');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
        Schema::table('acumulativos', function(Blueprint $table) {

            //$table->dropForeign('acumulativos_tipo_acumulativo_id_foreign');
            //$table->dropForeign('acumulativos_seccion_id_foreign');
             //$table->dropForeign('acumulativos_asignatura_id_foreign');
        });

    }
}
