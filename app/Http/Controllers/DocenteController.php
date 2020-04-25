<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Docente;
use Illuminate\Support\Facades\Crypt;

class DocenteController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
         $docentes=Docente::all();

        if(!is_null($docentes) and sizeof($docentes)!= 0){

            foreach ($docentes as $docente) {
                # code...
                $docente->asignaturas;

                foreach ($docente->asignaturas as $asignatura) {
                    # code...
                    $asignatura->secciones;
                }
            }

            return response()->json($docentes);
        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro ningun tipo de acumulativo' ], 204 );
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

        $validator = \Validator::make($request->all(), ['email' => 'required','password_sace' => 'required','direccion' => 'required','telefono' => 'required','nombre' => 'required','user_sace' => 'required','apellido' => 'required','genero' => 'required']);

        if ($validator->fails()){

            return response()->json($validator->errors(), 422);

        }else{
        //
                    $docente=Docente::where('user_sace',"=",$request->user_sace)->first();

                    if(!is_null($docente) or sizeof($docente) != 0){


                            $docente->nombre=$request->nombre;
                            $docente->apellido=$request->apellido;
                            $docente->genero=$request->genero;
                            $docente->telefono=$request->telefono;
                            $docente->direccion=$request->direccion;
                            $docente->password_sace=Crypt::encryptString($request->password_sace);
                            $docente->email=$request->email;
                            $docente->password=Crypt::encryptString($request->password_sace);
                            $docente->save();


                        return response()->json($docente);

                    }else{
                            $docente=new Docente;

                            $docente->username=$request->user_sace;
                            $docente->nombre=$request->nombre;
                            $docente->apellido=$request->apellido;
                            $docente->genero=$request->genero;
                            $docente->telefono=$request->telefono;
                            $docente->direccion=$request->direccion;
                            $docente->user_sace=$request->user_sace;
                            $docente->password_sace=Crypt::encryptString($request->password_sace);
                            $docente->email=$request->email;
                            $docente->password=Crypt::encryptString($request->password_sace);
                            $docente->save();
                            return response()->json($docente);
                        }
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
}
