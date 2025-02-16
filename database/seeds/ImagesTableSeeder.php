<?php

use Illuminate\Database\Seeder;
use App\Image;
use Faker\Factory as Faker;

class ImagesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        //
        $faker =Faker::create();
        $imagenLinks=array(
        	"https://videotutoriales.com/maspa/maspa1",
        	"https://videotutoriales.com/maspa/maspa2",
        	"https://videotutoriales.com/maspa/maspa3",
        	"https://videotutoriales.com/maspa/maspa4",
        	"https://videotutoriales.com/maspa/maspa5",
        	"https://videotutoriales.com/maspa/maspa6",
        	"https://videotutoriales.com/maspa/maspa7",
        	"https://videotutoriales.com/maspa/maspa8",
        );

        foreach ($imagenLinks  as $imageLink) {
        	# code...
        	Image::create([
        		'title'=>$faker->text(80),
        		'description'=> $content=$faker->paragraph(18),
        		'thumbnail'=>$imageLink.".jpg",
        		'imageLink'=>$imageLink."-1.jpg",
        		'user_id'=>$faker->numberBetween($min=1,$max=5),
        	 ]);
        }
    }
}
