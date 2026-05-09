<?php
// ไฟล์สำหรับ WebChatController (จัดการหน้าเว็บไซต์สำหรับการสนทนากับ AI)

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class WebChatController extends Controller
{
    public function index(Request $request)
    {
        $sessions = \App\Models\ChatSession::where('user_id', auth()->id())
            ->with(['messages' => function ($query) {
                $query->orderBy('timestamp', 'asc');
            }])
            ->orderBy('timestamp', 'desc')
            ->get();

        return view('chat', compact('sessions'));
    }
}
