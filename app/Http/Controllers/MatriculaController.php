<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Matricula;

class MatriculaController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
        return "Hola";
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

    public function buscar_por_year(Request $request){
        //return "Hola mundo";
        //$matriculas=Matricula::where('seccion_id',"=",$request->seccion_id)->where('year',"=",$request->year)->get();
        $matriculas=Matricula::where('seccion_id',"=",$request->seccion_id)->get();

        // se verifica la existencia del alumno
        if(!is_null($matriculas) or sizeof($matriculas)!= 0){

            foreach ($matriculas as $matricula) {
                $matricula->alumno;
                $matricula->seccion;
                $matricula->seccion->modalidad;
            }

            //se envia el json al navegador
            return response()->json($matriculas);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro las matriculas' ], 204 );
        }
    }
}
