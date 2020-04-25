<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Seccion;

class SeccionController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
        $secciones=Seccion::all();

             // se verifica la existencia de la bodega
        if(!is_null($secciones) and sizeof($secciones) != 0){

            //$asistecnias->asistencias;
            //$alumnos[1]->asistencias;
            foreach ($secciones as  $seccion) {
                # code...
                $seccion->modalidad;
                $seccion->periodo;
                $seccion->centro;
            }
            //$secciones
            

            $json_asistencias=json_decode($secciones, true);
            //se envia el json al navegador
            return response()->json($json_asistencias);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro ninguna seccion' ], 204 );
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
        $seccion=new Seccion;

        $seccion->modalidad_id=$request->modalidad_id;
        $seccion->curso=$request->curso;
        $seccion->seccion=$request->seccion;
        $seccion->jornada=$request->jornada;

        $seccion->save();
        return response()->json( ['success'=>true, 'msg'=>'Se  guardo la seccion' ], 200);
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
        $seccion=Seccion::where('id',"=",$id)->first();


        // se verifica la existencia del alumno
        if(!is_null($seccion) or sizeof($seccion)!= 0){

            $seccion->modalidad;

            //se envia el json al navegador
            return response()->json($seccion);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro la seccion' ], 204 );
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
        //




        $seccion=Seccion::find($id);

        // se verifica la existencia del alumno
        if(!is_null($seccion) or sizeof($seccion)!= 0){

            $seccion->modalidad_id=$request->modalidad_id;
            $seccion->curso=$request->curso;
            $seccion->seccion=$request->seccion;
            $seccion->jornada=$request->jornada;

            $seccion->save();


            return response()->json( ['success'=>true, 'msg'=>'Se actualizo la seccion' ], 200);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro la seccion' ], 204 );
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
        $seccion=Seccion::find($id);

        if(!is_null($seccion) or sizeof($seccion)!= 0){
            $seccion->delete();
             return response()->json( ['success'=>true, 'msg'=>'Se elimino el seccion' ], 200);
        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro la seccion' ], 204 );
        }
    }

    public function docente_secciones(Request $request){

        $secciones=Seccion::join("asignaturas_secciones","seccions.id","=","asignaturas_secciones.seccion_id")
        ->select("seccions.id","seccions.modalidad_id","seccions.curso","seccions.seccion","centro_id","periodo_id","seccions.jornada","seccions.created_at","seccions.updated_at")
        ->where('asignaturas_secciones.docente_id','=',$request->docente_id)
        ->groupBy("seccions.id")
        ->get();

           // se verifica la existencia de la bodega
        if(!is_null($secciones) and sizeof($secciones) != 0){

            //$asistecnias->asistencias;
            //$alumnos[1]->asistencias;
            foreach ($secciones as  $seccion) {
                # code...
                $seccion->modalidad;
                $seccion->periodo;
                $seccion->centro;
            }
            //$secciones
            

           // $json_asistencias=json_decode($secciones, true);
            //se envia el json al navegador
            return response()->json($secciones);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro ninguna seccion' ], 204 );
        }

    }


    public function update_periodo(Request $request){

        //se realiza la comprobacion
        if (empty($request->json()->all()) or !$request->isJson()){

            return response()->json( ['error'=>true, 'msg'=>'No se encontro la seccion' ], 422 );

        }else{


            $secciones=$request->json()->all();
            //saco el numero de detalles
           $longitud_array = count($secciones);

            //Recorro todos los elementos y los actualizo
            for($i=0; $i<$longitud_array; $i++){

                

                $seccion=Seccion::find($request[$i]['id']);

                
                

                // se verifica la existencia del alumno
                if(!is_null($seccion) or sizeof($seccion)!= 0){

                    $seccion->periodo_id=$request[$i]['periodo_id'];

                    $seccion->save();

                }
                

            }
            
            

            return response()->json( $request[1]);

            return response()->json( ['success'=>true, 'msg'=>'Se modifico las secciones' ], 200);
        }

    }
}
