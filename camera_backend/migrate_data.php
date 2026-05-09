<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Camera;
use App\Models\Farm;

Camera::whereNull('farm_id')->get()->each(function($cam) {
    echo "Processing Camera ID: {$cam->id} - {$cam->name}\n";
    $farm = Farm::create([
        'user_id' => $cam->user_id,
        'name' => $cam->name . " (Farm)",
        'location' => $cam->location,
        'status' => 'active'
    ]);
    $cam->update(['farm_id' => $farm->id]);
    echo "Created Farm ID: {$farm->id} linked to Camera\n";
});
echo "Done!\n";
