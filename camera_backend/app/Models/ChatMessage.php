<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'chat_session_id',
        'text',
        'sender',
        'image_path',
        'timestamp'
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    public function session()
    {
        return $this->belongsTo(ChatSession::class, 'chat_session_id');
    }
}
