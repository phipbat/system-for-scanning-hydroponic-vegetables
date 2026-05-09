<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddMetricsToCameraAnalysesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('camera_analyses', function (Blueprint $table) {
            $table->decimal('ph_value', 4, 2)->nullable()->after('health_status');
            $table->decimal('ec_value', 4, 2)->nullable()->after('ph_value');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('camera_analyses', function (Blueprint $table) {
            //
        });
    }
}
