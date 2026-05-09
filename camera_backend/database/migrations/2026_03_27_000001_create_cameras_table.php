<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCamerasTable extends Migration
{
    public function up()
    {
        Schema::create('cameras', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('location')->nullable();
            $table->string('ip_address')->nullable();
            $table->integer('port')->default(554);
            $table->string('username')->nullable();
            $table->string('password')->nullable();
            $table->string('stream_path')->nullable();
            $table->enum('connection_type', ['RTSP', 'HTTP', 'ONVIF'])->default('RTSP');
            $table->enum('status', ['active', 'inactive', 'offline'])->default('active');
            $table->timestamp('last_heartbeat')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('cameras');
    }
}
