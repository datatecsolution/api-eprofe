<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Modalidad;

class ModalidadesController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
         $modalidades=Modalidad::all();

             // se verifica la existencia de la bodega
        if(!is_null($modalidades) or sizeof($modalidades) != 0){


            $json_asignaturas=json_decode($modalidades, true);
            //se envia el json al navegador
            return response()->json($json_asignaturas);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro ningun modalidad' ], 204 );
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
        $modalidad= new Modalidad;

        $modalidad->alias=$request->alias;
        $modalidad->nombre=$request->nombre;
        $modalidad->observaciones=$request->observaciones;

        $modalidad->save();
        return response()->json( ['success'=>true, 'msg'=>'Se guardo la modalidad' ], 200);
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
        $modalidad=Modalidad::find($id);
             // se verifica la existencia de la bodega
        if(!is_null($modalidad) or sizeof($modalidad) != 0){


            $json_asignaturas=json_decode($modalidad, true);
            //se envia el json al navegador
            return response()->json($json_asignaturas);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro ningun modalidad' ], 204 );
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
        $modalidad=Modalidad::find($id);

        // se verifica la existencia del alumno
        if(!is_null($modalidad) or sizeof($modalidad)!= 0){

            $modalidad= new Modalidad;

            $modalidad->alias=$request->alias;
            $modalidad->nombre=$request->nombre;
            $modalidad->observaciones=$request->observaciones;

            $modalidad->save();

            return response()->json( ['success'=>true, 'msg'=>'Se actualizo la modalidad' ], 200);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro la modalidad' ], 204 );
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
        $modalidad=Modalidad::find($id);
             // se verifica la existencia de la bodega
        if(!is_null($modalidad) or sizeof($modalidad) != 0){


           $modalidad->delete();
            //se envia el json al navegador
           return response()->json( ['error'=>true, 'msg'=>'Se elimino la modalidad' ], 200);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro ningun modalidad' ], 204 );
        }
    }
}
