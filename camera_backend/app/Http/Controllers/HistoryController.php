<?php
// ไฟล์สำหรับ HistoryController (จัดการประวัติการสแกนและการสนทนากับ AI ย้อนหลัง)

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HistoryController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type', 'all');
        $history = collect();

        if ($type === 'chat') {
            $history = \App\Models\ChatSession::where('user_id', auth()->id())
                ->orderBy('timestamp', 'desc')
                ->paginate(20);
            return view('history', compact('history', 'type'));
        }

        return view('history', compact('history', 'type'));
    }

    public function showChat($id)
    {
        $session = \App\Models\ChatSession::where('user_id', auth()->id())
            ->where('id', $id)
            ->with(['messages' => function ($q) {
                $q->orderBy('timestamp', 'asc');
            }])
            ->firstOrFail();

        return view('chat_detail', compact('session'));
    }

    public function sendMessage(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string|max:2000'
        ]);

        $session = \App\Models\ChatSession::where('user_id', auth()->id())
            ->where('id', $id)
            ->firstOrFail();

        $userMessageText = $request->input('message');
        $now = now()->timestamp * 1000;

        // 1. Save User Message
        $userMsgId = 'msg_' . uniqid();
        \App\Models\ChatMessage::create([
            'id' => $userMsgId,
            'chat_session_id' => $session->id,
            'sender' => 'user',
            'text' => $userMessageText,
            'timestamp' => $now
        ]);

        // 2. Prepare Context for Gemini
        $chatHistory = $session->messages()->orderBy('timestamp', 'asc')->get();
        $contents = [];
        
        // System Context
        $contents[] = [
            'role' => 'user', 
            'parts' => [['text' => 'You are PlantoEye AI, a helpful and expert hydroponic agriculture assistant. Keep your answers concise, clear, and in Thai.']]
        ];
        $contents[] = [
            'role' => 'model', 
            'parts' => [['text' => 'รับทราบครับ ฉันพร้อมให้คำปรึกษาด้านการเกษตรและฟาร์มไฮโดรโปนิกส์แล้วครับ']]
        ];

        foreach ($chatHistory as $msg) {
            $role = $msg->sender === 'user' ? 'user' : 'model';
            // Note: We skip uploading historical images to Gemini from backend to save tokens, using text context only.
            if ($msg->text) {
                $contents[] = [
                    'role' => $role,
                    'parts' => [['text' => $msg->text]]
                ];
            }
        }

        // Add the new message
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $userMessageText]]
        ];

        // 3. Call Gemini API
        $apiKey = env('GEMINI_API_KEY');
        if (!$apiKey) {
            return back()->with('error', 'ระบบยังไม่ได้ตั้งค่า API Key สำหรับ AI');
        }

        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}";
        
        try {
            $response = \Illuminate\Support\Facades\Http::post($url, [
                "contents" => $contents,
                "generationConfig" => [
                    "temperature" => 0.7,
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $aiResponseText = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'ขออภัย ฉันไม่สามารถประมวลผลคำตอบได้ในขณะนี้';

                // 4. Save AI Response
                $aiMsgId = 'msg_' . uniqid();
                \App\Models\ChatMessage::create([
                    'id' => $aiMsgId,
                    'chat_session_id' => $session->id,
                    'sender' => 'bot',
                    'text' => $aiResponseText,
                    'timestamp' => now()->timestamp * 1000
                ]);

                // Update session last message
                $session->update([
                    'last_message' => \Illuminate\Support\Str::limit($aiResponseText, 100),
                    'timestamp' => now()->timestamp * 1000
                ]);
            } else {
                return back()->with('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI: ' . $response->body());
            }
        } catch (\Exception $e) {
            return back()->with('error', 'เกิดข้อผิดพลาด: ' . $e->getMessage());
        }

        return redirect()->route('history.chat.show', ['id' => $id]);
    }

    public function destroyAnalysis($id)
    {
        return redirect()->back()->with('error', 'ระบบวิเคราะห์เดิมถูกยกเลิกแล้ว');
    }

    public function destroyChat($id)
    {
        $session = \App\Models\ChatSession::where('user_id', auth()->id())->findOrFail($id);
        
        // ลบไฟล์รูปภาพที่เกี่ยวข้องในแชท (ถ้ามี)
        foreach ($session->messages as $msg) {
            if ($msg->image_path && str_starts_with($msg->image_path, 'storage/')) {
                $path = str_replace('storage/', 'public/', $msg->image_path);
                \Illuminate\Support\Facades\Storage::delete($path);
            }
        }
        
        $session->delete();
        
        return redirect()->back()->with('success', 'ลบประวัติการพูดคุยสำเร็จเรียบร้อย');
    }
}
