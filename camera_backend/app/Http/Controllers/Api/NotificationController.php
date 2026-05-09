<?php
// ไฟล์สำหรับ Api/NotificationController (จัดการการแจ้งเตือนต่างๆ ภายในระบบผ่าน API)

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $notifications = Notification::where('user_id', $user->id)
            ->with('analysis')
            ->orderBy('created_at', 'desc')
            ->limit(30)
            ->get();

        return response()->json([
            'data' => $notifications
        ]);
    }

    public function markAsRead($id)
    {
        $notification = Notification::where('user_id', Auth::id())->findOrFail($id);
        $notification->update(['is_read' => true]);

        return response()->json([
            'status' => 'success',
            'message' => 'Notification marked as read'
        ]);
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())->update(['is_read' => true]);

        return response()->json([
            'status' => 'success',
            'message' => 'All notifications marked as read'
        ]);
    }
}
