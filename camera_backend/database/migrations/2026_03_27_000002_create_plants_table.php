<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePlantsTable extends Migration
{
    public function up()
    {
        Schema::create('plants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('species')->nullable();
            $table->string('variety')->nullable();
            $table->string('location')->nullable();
            $table->string('system_type')->default('NFT');
            $table->decimal('ph_target', 3, 1)->default(6.0);
            $table->decimal('ec_target', 4, 2)->default(1.5);
            $table->date('planted_at')->nullable();
            $table->enum('status', ['growing', 'harvested', 'dead'])->default('growing');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('plants');
    }
}
