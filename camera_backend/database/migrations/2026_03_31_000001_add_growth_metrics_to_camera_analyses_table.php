<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddGrowthMetricsToCameraAnalysesTable extends Migration
{
    public function up()
    {
        Schema::table('camera_analyses', function (Blueprint $table) {
            $table->decimal('plant_height', 6, 2)->nullable()->after('ec_value');
            $table->decimal('canopy_width', 6, 2)->nullable()->after('plant_height');
            $table->decimal('leaf_width', 6, 2)->nullable()->after('canopy_width');
            $table->unsignedInteger('leaf_count')->nullable()->after('leaf_width');
            $table->decimal('fresh_weight_with_root', 8, 2)->nullable()->after('leaf_count');
        });
    }

    public function down()
    {
        Schema::table('camera_analyses', function (Blueprint $table) {
            $table->dropColumn([
                'plant_height',
                'canopy_width',
                'leaf_width',
                'leaf_count',
                'fresh_weight_with_root',
            ]);
        });
    }
}

