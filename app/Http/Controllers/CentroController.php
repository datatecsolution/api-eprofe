<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Centro;

class CentroController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
        $centros=Centro::all();
        // se verifica la existencia del alumno
        if(!is_null($centros) and sizeof($centros)!= 0){



            //se envia el json al navegador
            return response()->json($centros);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro el alumno' ], 204 );
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
        $centro=new Centro;

        $centro->nombre=$request->nombre;
        $centro->codigo_sace=$request->codigo_sace;
        $centro->direccion=$request->direccion;
        $centro->telefono=$request->telefono;

        $centro->save();

        return response()->json( ['success'=>true, 'msg'=>'Se guardo el centro' ], 200);


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
        $centro=Centro::where('codigo_sace',"=",$id)->first();


        // se verifica la existencia del alumno
        if(!is_null($centro) or sizeof($centro)!= 0){



            //se envia el json al navegador
            return response()->json($centro);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro el centro' ], 204 );
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
        $centro=Centro::where('codigo_sace',"=",$id)->first();


        // se verifica la existencia del alumno
        if(!is_null($centro) or sizeof($centro)!= 0){

            $centro->nombre=$request->nombre;
            $centro->codigo_sace=$request->codigo_sace;
            $centro->direccion=$request->direccion;
            $centro->telefono=$request->telefono;

            $centro->save();

            //se envia el json al navegador
            return response()->json( ['success'=>true, 'msg'=>'Se actualizo el centro' ], 200);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro el centro' ], 204 );
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
        $centro=Centro::where('codigo_sace',"=",$id)->first();

        // se verifica la existencia del alumno
        if(!is_null($centro) or sizeof($centro)!= 0){
            $centro->delete();
             return response()->json( ['success'=>true, 'msg'=>'Se elimino el centro' ], 200);
        }else{
              return response()->json( ['error'=>true, 'msg'=>'No se encontro el centro' ], 204 );
        }
    }
}
