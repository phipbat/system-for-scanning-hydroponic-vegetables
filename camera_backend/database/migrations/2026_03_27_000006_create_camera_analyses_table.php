<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCameraAnalysesTable extends Migration
{
    public function up()
    {
        Schema::create('camera_analyses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('camera_id')->nullable();
            $table->unsignedBigInteger('plant_id')->nullable();
            $table->string('plant_name');
            $table->string('identified_species')->nullable();
            $table->text('health_status');
            $table->string('diagnosis_summary')->nullable();
            $table->text('diagnosis_details')->nullable();
            $table->text('recommendation')->nullable();
            $table->decimal('confidence', 5, 2)->default(0);
            $table->string('severity')->default('Normal');
            $table->string('source')->default('Camera Backend');
            $table->string('image_path')->nullable();
            $table->timestamp('timestamp')->index()->useCurrent();
            $table->timestamps();

            $table->foreign('camera_id')->references('id')->on('cameras')->onDelete('set null');
            $table->foreign('plant_id')->references('id')->on('plants')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('camera_analyses');
    }
}
