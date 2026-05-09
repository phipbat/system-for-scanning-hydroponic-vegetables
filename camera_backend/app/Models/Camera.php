<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Camera extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'farm_id',
        'name',
        'location',
        'ip_address',
        'port',
        'username',
        'password',
        'stream_path',
        'stream_url',
        'connection_type',
        'status',
        'last_heartbeat'
    ];

    public function farm()
    {
        return $this->belongsTo(Farm::class);
    }

    public function analyses()
    {
        return $this->hasMany(CameraAnalysis::class);
    }
}
