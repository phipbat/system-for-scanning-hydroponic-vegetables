<?php
// ไฟล์สำหรับ Api/ChatController (จัดการการซิงค์ประวัติการคุยกับ AI ระหว่าง Mobile และ MySQL)

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    /**
     * ดึงเซสชันการสนทนาทั้งหมดของผู้ใช้
     */
    public function index(Request $request)
    {
        $sessions = \App\Models\ChatSession::where('user_id', $request->user()->id)
            ->with(['messages' => function ($query) {
                $query->orderBy('timestamp', 'asc');
            }])
            ->orderBy('timestamp', 'desc')
            ->get();

        return response()->json(['sessions' => $sessions]);
    }

    /**
     * Get details of a specific chat session.
     */
    public function show($id, Request $request)
    {
        $session = \App\Models\ChatSession::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->with(['messages' => function ($query) {
                $query->orderBy('timestamp', 'asc');
            }])->firstOrFail();

        return response()->json(['session' => $session]);
    }

    /**
     * Sync a chat session from mobile.
     */
    public function sync(Request $request)
    {
        $request->validate([
            'id' => 'required|string',
            'title' => 'required|string',
            'lastMessage' => 'nullable|string',
            'timestamp' => 'required|numeric',
            'messages' => 'required|array',
        ]);

        $user = $request->user();

        // Upsert Session
        $session = \App\Models\ChatSession::updateOrCreate(
            ['id' => $request->id],
            [
                'user_id' => $user->id,
                'title' => $request->title,
                'last_message' => $request->lastMessage,
                'timestamp' => $request->timestamp,
            ]
        );

        // Process Messages
        $syncedMessages = [];
        foreach ($request->messages as $msg) {
            $imagePath = null;
            
            // Handle image upload from base64 if provided
            if (!empty($msg['imageBase64'])) {
                $imageData = $msg['imageBase64'];
                // Remove data uri header if exists (e.g., data:image/jpeg;base64,)
                if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $type)) {
                    $imageData = substr($imageData, strpos($imageData, ',') + 1);
                    $type = strtolower($type[1]); // jpg, png, gif
                } else {
                    $type = 'jpg';
                }
                
                $imageData = base64_decode($imageData);
                if ($imageData) {
                    $fileName = 'chat_' . $session->id . '_' . $msg['id'] . '.' . $type;
                    $filePath = 'public/chat_images/' . $fileName;
                    \Illuminate\Support\Facades\Storage::put($filePath, $imageData);
                    $imagePath = 'storage/chat_images/' . $fileName;
                }
            } else if (!empty($msg['imageUri']) && str_starts_with($msg['imageUri'], 'http')) {
                // If it's already an uploaded URL
                $imagePath = $msg['imageUri'];
            }

            $chatMsg = \App\Models\ChatMessage::updateOrCreate(
                ['id' => (string)$msg['id'], 'chat_session_id' => $session->id],
                [
                    'text' => $msg['text'] ?? '',
                    'sender' => $msg['sender'],
                    'timestamp' => $msg['timestamp'],
                    'image_path' => $imagePath,
                ]
            );
            $syncedMessages[] = $chatMsg;
        }

        return response()->json([
            'message' => 'Chat session synced successfully',
            'session' => $session
        ]);
    }

    /**
     * Delete a chat session.
     */
    public function destroy($id, Request $request)
    {
        $session = \App\Models\ChatSession::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();
            
        // Delete associated files (optional, but good practice)
        foreach ($session->messages as $msg) {
            if ($msg->image_path && str_starts_with($msg->image_path, 'storage/')) {
                $path = str_replace('storage/', 'public/', $msg->image_path);
                \Illuminate\Support\Facades\Storage::delete($path);
            }
        }
        
        $session->delete();

        return response()->json(['message' => 'Chat session deleted successfully']);
    }
}
