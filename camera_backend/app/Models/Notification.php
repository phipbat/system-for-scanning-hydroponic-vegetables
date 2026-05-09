<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'camera_analysis_id',
        'title',
        'message',
        'is_read',
        'type',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function analysis()
    {
        return $this->belongsTo(CameraAnalysis::class, 'camera_analysis_id');
    }
}
