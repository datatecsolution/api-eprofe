<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Encabezadoasistencia;
use App\Detallesasistencia;

class AsistenciaDetalleController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
        $detalles=Detallesasistencia::all();

       


             // se verifica la existencia de la bodega
        if(!is_null($detalles) and sizeof($detalles) != 0){

            //para conseguir las asistencias de los alumnos

            //$detalles->encabezado;

           foreach($detalles as $detalle){
                $detalle->encabezadoAsistencia;
                $detalle->encabezadoAsistencia->seccion;
                $detalle->encabezadoAsistencia->asignatura;
                $detalle->alumno;

            }
            //$asistencias->detalles;
            

            $json_asistencias=json_decode($detalles, true);
            //se envia el json al navegador
            return response()->json($json_asistencias);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro ningun asignatura' ], 204 );
        }
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
        $detalle = new Detallesasistencia;

        $detalle->alumno_id=$request->alumno_id;
        $detalle->encabezadoasistencia_id=$request->encabezadoasistencia_id;
        $detalle->estado=$request->estado;

        $detalle->save();

        $detalle->id;
        $detalle->alumno;

        $json_asistencias=json_decode($detalle, true);

        return response()->json($json_asistencias);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
        $detalle = Detallesasistencia::find($id);

       // $detalle->estado=$request->estado;
        $detalle->alumno_id=$request->alumno_id;
        $detalle->encabezadoasistencia_id=$request->encabezadoasistencia_id;
        $detalle->estado=$request->estado;

        $detalle->save();


        $json_asistencias=json_decode($detalle, true);

        return response()->json($json_asistencias);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
