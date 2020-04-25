<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Encabezadoasistencia;
use App\Detallesasistencia;

class AsistenciaController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
         //
        $asistencias=Encabezadoasistencia::orderByDesc('fecha')->get();
       


             // se verifica la existencia de la bodega
        if(!is_null($asistencias) and sizeof($asistencias) != 0){

            //para conseguir las asistencias de los alumnos

           foreach($asistencias as $asistencia){
                $asistencia->detallesAsistencia;
                $asistencia->seccion->modalidad;
                $asistencia->asignatura;
                foreach($asistencia->detallesAsistencia as $detalle){
                        $detalle->alumno;
                }
              //  $asistencia->detalles[0]->alumno;

            }
            //$asistencias->detalles;
            

            $json_asistencias=json_decode($asistencias, true);
            //se envia el json al navegador
            return response()->json($json_asistencias);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro ningun asignatura' ], 422 );
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


         //se valida que todos los datos del acumulativo esten presentes
         $validator = \Validator::make($request->all(), ['seccion_id' => 'required',
                                                          'asignatura_id' => 'required',
                                                          'fecha' => 'required',
                                                          'detalles_asistencia' => 'required']);


         //se realiza la comprobacion
        if ($validator->fails()){

            return response()->json($validator->errors(), 422);

        }else{


            $encabezaasistencia = new Encabezadoasistencia;

            $encabezaasistencia->seccion_id=$request->seccion_id;
            $encabezaasistencia->asignatura_id=$request->asignatura_id;
            $encabezaasistencia->fecha=$request->fecha;

            $encabezaasistencia->save();

            $encabezaasistencia->id;


            $detalles_asistencia=$request->detalles_asistencia;

            //saco el numero de detalles
            $longitud_array = count($detalles_asistencia);

            //Recorro todos los elementos y los actualizo
            for($i=0; $i<$longitud_array; $i++){

               
                $detalle=new Detallesasistencia;

                $detalle->alumno_id=$detalles_asistencia[$i]['alumno_id'];
                $detalle->encabezadoasistencia_id=$encabezaasistencia->id;
                $detalle->estado=$detalles_asistencia[$i]['estado'];
                $detalle->excusa=$detalles_asistencia[$i]['excusa'];

                $detalle->save();

                $detalle->id;
                $detalle->alumno;
            }

            $json_asistencias=json_decode($encabezaasistencia, true);

            return response()->json($json_asistencias);
    }


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
        //se busca el articulo por el codigo de barra
        $asistencia=Encabezadoasistencia::find($id);


        if(!is_null($asistencia) and sizeof($asistencia) != 0){


                $asistencia->detallesAsistencia;
                $asistencia->seccion->modalidad;
                $asistencia->asignatura;
                foreach($asistencia->detallesAsistencia as $detalle){
                        $detalle->alumno;
                }

             $json_asistencias=json_decode($asistencia, true);
            //se envia el json al navegador
            return response()->json($json_asistencias);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro ningun asistencia' ], 204 );
        }
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

        //se valida que todos los datos del acumulativo esten presentes
         $validator = \Validator::make($request->all(), ['seccion_id' => 'required',
                                                          'asignatura_id' => 'required',
                                                          'fecha' => 'required',
                                                          'detalles_asistencia' => 'required']);


         //se realiza la comprobacion
        if ($validator->fails()){

            return response()->json($validator->errors(), 422);

        }else{


                    //
                    $encabezaasistencia=Encabezadoasistencia::find($id);

                    if(!is_null($encabezaasistencia) or sizeof($encabezaasistencia)!= 0){


                        //$asistencia->seccion_id=$request->seccion_id;
                        //$asistencia->asignatura_id=$request->asignatura_id;
                         $encabezaasistencia->fecha=$request->fecha;

                        $encabezaasistencia->save();


                        $detalles_asistencia=$request->detalles_asistencia;

                        //saco el numero de detalles
                        $longitud_array = count($detalles_asistencia);

                        //Recorro todos los elementos y los actualizo
                        for($i=0; $i<$longitud_array; $i++){

                           
                            $detalle = Detallesasistencia::find($detalles_asistencia[$i]['id']);

                            //$detalle->alumno_id=$detalles_asistencia[$i]['alumno_id'];
                            //$detalle->encabezadoasistencia_id=$id;
                            $detalle->estado=$detalles_asistencia[$i]['estado'];
                            $detalle->excusa=$detalles_asistencia[$i]['excusa'];

                            $detalle->save();

            
                            $detalle->alumno;
                        }

                        /*

                            $asistencia->detallesAsistencia;
                            $asistencia->seccion->modalidad;
                            $asistencia->asignatura;
                            foreach($asistencia->detallesAsistencia as $detalle){
                                    $detalle->alumno;
                            }*/

                        $json_asistencias=json_decode($encabezaasistencia, true);

                        return response()->json($json_asistencias);

                    }else{
                          return response()->json( ['error'=>true, 'msg'=>'No se encontro la asistencia' ], 422 );
                    }
                }

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
        $asistencia=Encabezadoasistencia::find($id);

        // se verifica la existencia del alumno
        if(!is_null($asistencia) or sizeof($asistencia)!= 0){

            $asistencia->delete();
             return response()->json( ['success'=>true, 'msg'=>'Se elimino la asistencia' ], 200);
        }else{
              return response()->json( ['error'=>true, 'msg'=>'No se encontro la asistencia' ], 204 );
        }
    }


     public function docente(Request $request){

        //se valida que todos los datos del acumulativo esten presentes
         $validator = \Validator::make($request->all(), ['docente_id' => 'required','seccion_id'=>'required' ]);


         //se realiza la comprobacion
        if ($validator->fails()){

            return response()->json($validator->errors(), 422);

        }else{



            $asistencias=Encabezadoasistencia::join("asignaturas_secciones","encabezadoasistencias.asignatura_id","=","asignaturas_secciones.asignatura_id")
              ->join("asignaturas", function($join){
                $join->on("asignaturas.id","=","encabezadoasistencias.asignatura_id")
                ->on("asignaturas_secciones.seccion_id","=","encabezadoasistencias.seccion_id");
              })

              ->where('asignaturas_secciones.docente_id','=',$request->docente_id)
               ->where('encabezadoasistencias.seccion_id','=',$request->seccion_id)

              ->select("encabezadoasistencias.id","encabezadoasistencias.seccion_id","encabezadoasistencias.fecha","encabezadoasistencias.asignatura_id","encabezadoasistencias.created_at","encabezadoasistencias.updated_at")
              ->orderByDesc('fecha')->get();
       


             // se verifica la existencia de la bodega
        if(!is_null($asistencias) and sizeof($asistencias) != 0){

            //para conseguir las asistencias de los alumnos

               foreach($asistencias as $asistencia){
                    $asistencia->detallesAsistencia;
                    $asistencia->seccion->modalidad;
                    $asistencia->asignatura;
                    /*
                    foreach($asistencia->detallesAsistencia as $detalle){
                            $detalle->alumno;
                    }*/
                  //  $asistencia->detalles[0]->alumno;

                }
                //$asistencias->detalles;
                

                $json_asistencias=json_decode($asistencias, true);
                //se envia el json al navegador
                return response()->json($json_asistencias);

            }else{
                   return response()->json( ['error'=>true, 'msg'=>'No se encontro ningun asignatura' ], 422 );
            }

        }
     }

}
