<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CameraAnalysis extends Model
{
    use HasFactory;

    protected $fillable = [
        'camera_id',
        'plant_id',
        'plant_name',
        'identified_species',
        'health_status',
        'diagnosis_summary',
        'diagnosis_details',
        'recommendation',
        'confidence',
        'severity',
        'source',
        'image_path',
        'timestamp',
        'plant_height',
        'canopy_width',
        'leaf_width',
        'leaf_count',
        'fresh_weight_with_root',
        'ph_value',
        'ec_value'
    ];

    protected $casts = [
        'timestamp' => 'datetime',
    ];

    public function camera()
    {
        return $this->belongsTo(Camera::class);
    }

    public function plant()
    {
        return $this->belongsTo(Plant::class);
    }
}
