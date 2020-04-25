<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Asignatura;
use App\Seccion;

class AsignaturaController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
       // return "Hola mundo";
        //
        $asignaturas=Asignatura::all();

             // se verifica la existencia de la bodega
        if(!is_null($asignaturas) or sizeof($asignaturas) != 0){
            $asignaturas;
            
            foreach ($asignaturas as $asignatura) {
                        # code...
                        $asignatura->secciones;
                    }
                    


            $json_asignaturas=json_decode($asignaturas, true);


            //se envia el json al navegador
            return response()->json($json_asignaturas);

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
        $asignatura=new Asignatura;

        $asignatura->alias=$request->alias;
        $asignatura->nombre=$request->nombre;
        $asignatura->tipo=$request->tipo;

        $asignatura->save();
        return response()->json( ['success'=>true, 'msg'=>'Se guardo la asignatura' ], 200);
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
        $asignatura=Asignatura::find($id);

        // se verifica la existencia del alumno
        if(!is_null($asignatura) or sizeof($asignatura)!= 0){

            //se envia el json al navegador
            return response()->json($asignatura);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro la asignatura' ], 204 );
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
        $asignatura=Asignatura::find($id);

        // se verifica la existencia del alumno
        if(!is_null($asignatura) or sizeof($asignatura)!= 0){

            $asignatura->alias=$request->alias;
            $asignatura->nombre=$request->nombre;
            $asignatura->tipo=$request->tipo;

            $asignatura->save();

            return response()->json( ['success'=>true, 'msg'=>'Se actualizo la asignatura' ], 200);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro la asignatura' ], 204 );
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
        $asignatura=Asignatura::find($id);

        // se verifica la existencia del alumno
        if(!is_null($asignatura) or sizeof($asignatura)!= 0){

             $asignatura->delete();

            return response()->json( ['true'=>true, 'msg'=>'Se elimino la asignatura' ], 200);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro la asignatura' ], 204 );
        }
    }
    public function buscar_por_seccion(Request $request){
       // return "Hola de nuevo viejo";
        $asignaturas = Seccion::find($request->seccion_id)->asignaturas()->orderBy('nombre')->get();

        if(!is_null($asignaturas) or sizeof($asignaturas)!= 0){

              return response()->json($asignaturas);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro la asignatura' ], 204 );
        }
    }



    public function docente_asignaturas(Request $request){

        $resultados=DB::table('docentes')
            ->join('asignaturas_secciones', 'docentes.id', '=', 'asignaturas_secciones.docente_id')
            ->join('seccions', 'seccions.id', '=', 'asignaturas_secciones.seccion_id')
            ->join('periodos', 'periodos.id', '=', 'seccions.periodo_id')
            ->join('asignaturas', 'asignaturas_secciones.asignatura_id', '=', 'asignaturas.id')
            ->select("asignaturas.alias",
                "asignaturas.nombre",
                "asignaturas.tipo",
                "seccions.modalidad_id" ,
                "seccions.curso",
                "seccions.seccion",
                "seccions.jornada",
                "asignaturas_secciones.asignatura_id",
                 "asignaturas_secciones.seccion_id")
            ->where('docentes.id','=',$request->docente_id)
            ->where('seccions.id','=',$request->seccion_id)
            ->where('periodos.estado','=',"1")
            ->get();

            //return response()->json($resultados);

            $asignaturas=new Asignatura();
            $asignaturas=array();

        if(!is_null($resultados) or sizeof($resultados)!= 0){

            

            

            foreach ($resultados as $resultado) {
                $asignatura=new Asignatura;
                $asignatura->id=$resultado->asignatura_id;
                $asignatura->alias=$resultado->alias;
                $asignatura->nombre=$resultado->nombre;
                $asignatura->tipo=$resultado->tipo;

                $seccion=new Seccion;
                $seccion->id=$resultado->seccion_id;
                $seccion->modalidad_id=$resultado->modalidad_id;
                $seccion->curso=$resultado->curso;
                $seccion->seccion=$resultado->seccion;
                $seccion->jornada=$resultado->jornada;
                $seccion->modalidad;

                $asignatura->seccions->put("0",$seccion);

                //$asignatura->secciones->take(0);


                $asignaturas[]=$asignatura;

            }

              return response()->json($asignaturas);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro la asignatura' ], 204 );
        }
    }


}
