<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plant extends Model
{
    use HasFactory;

    public static function boot()
    {
        parent::boot();
    }

    protected $fillable = [
        'user_id',
        'name',
        'species',
        'variety',
        'location',
        'system_type',
        'ph_target',
        'ec_target',
        'planted_at',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected $casts = [
        'planted_at' => 'date',
    ];

    public function analyses()
    {
        return $this->hasMany(CameraAnalysis::class);
    }

    public function latestAnalysis()
    {
        return $this->hasOne(CameraAnalysis::class)->latestOfMany('timestamp');
    }
}
